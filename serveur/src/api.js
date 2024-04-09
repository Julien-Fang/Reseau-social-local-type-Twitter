const express = require("express");
const Users = require("./entities/users.js");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');


function init(db) {
    const router = express.Router();
    // On utilise JSON
    router.use(express.json());
    // simple logger for this router's requests
    // all requests to this router will first hit this middleware
    router.use((req, res, next) => {
        console.log('API: method %s, path %s', req.method, req.path);
        console.log('Body', req.body);
        next();
    });

    const users = new Users.default(db);


    //createUser
    //Mon coté client vérifie que confirmpassword = password
    router.post('/user', async (req, res) => {
        const { login, password, confirmpassword, lastname, firstname } = req.body;
        try {
          //Vérification des champs
          if (!login || !password || !confirmpassword || !lastname || !firstname) {
            res.status(400).json({ status: '400', message: 'Requête invalide : login, password, confirmpassword, lastname et firstname nécessaires' });
          return;
          }
          //Vérification que le login n'est pas déjà utilisé
          const user = await users.findUser(login);
          if (user) {
            res.status(404).json({ status: '404', message: 'Login déjà utilisé' });
            return;
          }
          //Hashage du mot de passe
          const hash = await users.hashPassword(password);
          const confirmpasswordHash = hash;
          const result = await users.addUser(login, hash, confirmpasswordHash, lastname, firstname);
          res.status(201).json({ status: '201', message: 'Utilisateur créé' });
        } catch (err) {
            console.log(err);
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });
      

    //Login, Se connecter
    router.post('/user/login', async (req, res, next) => {
        try {        
          const { login, password } = req.body;
          // Erreur sur la requête HTTP
          if (!login || !password) {
            res.status(400).json({
              status: 400,
              message: "Requête invalide : login et password nécessaires"
            });
            return;
          }

          const userid = await users.checkPassword(login,password);//renvoie l'id de l'utilisateur
          if (userid) {
            //const token = jwt.sign({id : userid },'webdev', {expiresIn: 86400});
            req.session.regenerate(async function (err) {
              if (err) {
                res.status(500).json({
                  status: 500,
                  message: "Erreur interne"
                });
              }
              else {
                // C'est bon, nouvelle session créée
                req.session.isLogged =true;
                req.session.userid = userid;//contient l'userid de l'utilsateur
                console.log(userid);
                await users.updateUser(userid, true);
                res.status(200).json({ status: '200', message: "Connexion accepté", isLogged : true, userid : userid});
              }
            });
            return;
          }
          //Faux login :destruction de la session et erreur
          req.session.destroy((err) => { });
          res.status(403).json({ status: '403', message: 'Login et/ou mot de passe incorrect' });
          return;
          
        }
        catch (e) {
          // Toute autre erreur
          res.status(500).json({
              status: 500,
              message: "erreur interne",
              details: (e || "Erreur inconnue").toString()
          });
        }
    });


    //Permet un renvoie sur la page d'accueil si l'utilisateur est déjà connecté
    router.get('/user/relog', async (req, res) => {
      if(req.session.isLogged){
        res.redirect('/api/user/'+req.session.userid);
      } else {
        console.log("pas connecté");
        res.status(403).json({ status: '403', message: 'Utilisateur non connecté' });
        res.end();
      }
      //res.redirect('/user/login');
    });


      //Logout, Se deconnecter
      router.delete('/user/:userid/logout', async (req, res) => {
        const { userid } = req.params;
        console.log("DECO : "+userid);
        
        try {
          //Vérification que l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant/non connecté' });
            return;
          }
          //Vérification que l'utilisateur est déjà déconnecté
          if(!user.isLogged){
            console.log("déjà déconnecté");
            res.status(403).json({ status: '403', message: 'Utilisateur déjà déconnecté' });
            return;
          }

          //Déconnexion
          //res.clearCookie('toti');
          res.cookie('toti', '', { maxAge: 0 });

          req.session.isLogged =false;
          req.session.destroy((err) => { });
          
          await users.updateDisconnect(userid, false);
          res.status(200).json({ status: '200', message: 'Sessionn fermée' });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
  
      });


      //getUserInfo , affiche le nombre d'utilisateur dans la base de donnée
      router.get('/user/infos', async (req, res) => {
        try{
          const nb = await users.countUsers();
          console.log(nb);
          res.status(200).json({count: nb });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });


      //getUser, renvoie un utilisateur
      router.get('/user/:userid', async (req, res) => {
        const { userid } = req.params;
        console.log("API USER "+userid);
        try {
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }
          res.status(200).json({ user });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });

      //deleteUser, supprime un utilisateur
      router.delete('/user/:userid', async (req, res) => {
        const { userid } = req.params;
        try {
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }
          await users.deleteUser(userid);
          res.status(200).json({ status: '200', message: 'Utilisateur supprimé' });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });
      



      //getAllUsersID, renvoie tous les id des utilisateurs sauf celui passé en paramètre
      router.get('/user/:userid/allUsers', async (req, res) => {
        const { userid } = req.params;
        try {
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }
          const all = await users.getAllUsers();
          const allUsers=[];
          for(let i=0; i<all.length; i++){
            if(all[i].id != userid){
              allUsers.push(all[i]);}
          }

          res.status(200).json({ allUsers });

        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });






      //getUsersByWord, filtrer les utilisateurs par leur nom ou prénom
      router.get('/user/:userid/word', async (req, res) => {
        const { userid } = req.params;
        const { word } = req.query;
        console.log("MOT :"+word);
        try {

          const all = await users.getAllUsersExceptMe(userid);
          if(!all){
            res.status(404).json({ status: '404', users: "Vide" });
            return;
          }
          const usersFilter=[];
          for( u of all){
            if((u.lastname.toLowerCase()==word.toLowerCase() || u.firstname.toLowerCase()==word.toLowerCase())){
              usersFilter.push(u);
            }
          }
          if(usersFilter.length==0){
            res.status(200).json({ status: '200', users: all });
            return;
          }

          res.status(200).json({ users: usersFilter, mot : word});

        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      

      //createFriend, créer un lien d'amitié, login = utilisateur courant souhaitant suivre userid
      router.post('/friends/user/:userid/friends', async (req, res) => {
        const { userid } = req.params;
        const { login } = req.body;
        try {
          if(!login){
            res.status(400).json({ status: '400', message: 'Bad request' });
            return;
          } 
          //celui qu'on souhaite suivre
          const userfriend = await users.findUserById(userid);
          if (!userfriend) {
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }
          //Vérifier si l'utilisateur existe et s'il ne se suit pas lui-même
          const user = await users.findUserByLogin(login);
          if(!user){
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }
          if(user.id == userid){
            res.status(400).json({ status: '400', message: 'On ne peut pas se suivre soi-même' });
            return;
          }
          //Vérifier si l'utilisateur suite déjà l'utilisateur qu'on veut suivre
          const friend = await users.findFriend(user.id, userid);
          if(friend){
            res.status(409).json({ status: '409', message: 'Vous suivez déjà cet utilisateur' });
            return;
          }
          //Ajouter l'utilisateur userid dans ma liste d'amis
          await users.addfollowed(user.id, userfriend.id);
          //Ajouter moi dans la liste d'amis de l'utilisateur userid
          await users.addfollower(user.id,userfriend.id);
          res.status(201).json({ status: '201', message: 'Ami suivi' });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });


      //getListFriends, obtenir la liste d'ami d'un utilisateur userid
      router.get('/friends/user/:userid/friends', async (req, res) => {
        const { userid } = req.params;
        try {
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }
          //Vérifier si l'utilisateur a des amis dans la base de donnée
          const friendDoc = await users.findfollowed(userid);
          if(!friendDoc){
            res.status(404).json({ status: '404', message: 'Utilisateur sans ami' });
            return;
          }
          const friendsIDs = friendDoc.followed;
          const friendList = [];
          for (const friendID of friendsIDs) {
            const friend = await users.findUserById(friendID);
            friendList.push(friend.login);
          }
          //res.status(200).json({ friends: friendList.join(', ') });
          res.status(200).json({ friends: friendList });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });





      //getFriendOrNot, Savoir si les deux utilisateurs sont amis
      router.get('/friends/user/:userid1/friendsOrNot/:userid2', async (req, res) => {
        const { userid1,userid2 } = req.params;
        try {
          const user1 = await users.findUserById(userid1);
          if (!user1) {
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }

          const user2 = await users.findUserById(userid2);
          if (!user2) {
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }

          const friendDoc = await users.findfollowed(userid1);
          const friendsIDs = friendDoc.followed;
          if( friendsIDs.includes(userid2)){
            res.status(200).json({ status: '200', friendsOrNot: true });
          }
          else{
            res.status(200).json({ status: '200', friendsOrNot: false });
          }
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      //getListFriendsID, obtenir la liste ID d'ami d'un utilisateur userid
      router.get('/friends/user/:userid/friendsID', async (req, res) => {
        const { userid } = req.params;
        try {
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }
          //Vérifier si l'utilisateur a des amis dans la base de donnée
          const friendDoc = await users.findfollowed(userid);
          if(!friendDoc){
            res.status(404).json({ status: '404', message: 'Utilisateur sans ami' });
            return;
          }
          const friendsID = friendDoc.followed;
          
          
          //res.status(200).json({ friends: friendList.join(', ') });
          res.status(200).json({ friendsID: friendsID });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



  


      //getListFollowersID, obtenir la liste ID des followers d'un utilisateur userid
      router.get('/friends/user/:userid/followersID', async (req, res) => {
        const { userid } = req.params;
        try {
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: 'Utilisateur inexistant' });
            return;
          }
          //Vérifier si l'utilisateur a des amis dans la base de donnée
          const friendDoc = await users.findfollower(userid);
          if(!friendDoc){
            res.status(404).json({ status: '404', message: 'Utilisateur sans ami' });
            return;
          }
          const followersID = friendDoc.follower;
          
          res.status(200).json({ followersID: followersID });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });





      //getFriendRelationship, renvoie les amis en commun entre userid1 et userid2
      router.get('/friends/user/:userid1/friends/:userid2', async (req, res) => {
        const { userid1, userid2 } = req.params;
        try {
          //Vérifier si les deux utilisateurs référencent la même personne
          if(userid1 == userid2){
            res.status(400).json({ status: '400', message: 'Les deux utilisateurs reference la même personne' });
            return;
          }
          //Vérifier si l'userid1 existe
          const user1 = await users.findUserById(userid1);
          if (!user1) {
            res.status(404).json({ status: '404', message: `Utilisateur ${userid1} n'a pas d'amis`} );
            return;
          }
          //Vérifier si l'userid2 existe
          const user2 = await users.findUserById(userid2);
          if (!user2) {
            res.status(404).json({ status: '404', message: `Utilisateur ${userid2} n'a pas d'amis` });
            return;
          }
          //Vérifier si l'userid1 a des amis dans la base de donnée
          const friendDoc1 = await users.findfollowed(userid1);
          if(!friendDoc1){
            res.status(404).json({ status: '404', message:`Utilisateur ${userid1} n'a pas d'amis` });
            return;
          }
          //Vérifier si l'userid2 a des amis dans la base de donnée
          const friendDoc2 = await users.findfollowed(userid2);
          if(!friendDoc2){
            res.status(404).json({ status: '404', message: `Utilisateur ${userid2} n'a pas d'amis` });
            return;
          }
          //Rechercher les amis en commun
          const friendsIDs1 = friendDoc1.followed;
          const friendsIDs2 = friendDoc2.followed;
          console.log(friendsIDs1);
          console.log(friendsIDs2);
          const commonFriends = [];
          for (const friendID of friendsIDs1) {
            if(friendsIDs2.includes(friendID)){
              const friend = await users.findUserById(friendID);
              commonFriends.push(friend.login);
            }
          }
          if(commonFriends.length == 0){
            res.status(404).json({ status: '404', message: 'Aucun ami en commun' });
            return;
          }
          res.status(200).json({ friends: commonFriends.join(', ') });  
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //getFriendRelationship2, renvoie les ID amis en commun entre userid1 et userid2
      router.get('/friends2/user2/:userid1/friends/:userid2', async (req, res) => {
        const { userid1, userid2 } = req.params;
        try {
          //Vérifier si l'userid1 existe
          const user1 = await users.findUserById(userid1);
          if (!user1) {
            res.status(404).json({ status: '404', message: `Utilisateur ${userid1} n'a pas d'amis`} );
            return;
          }

          //Vérifier si l'userid2 existe
          const user2 = await users.findUserById(userid2);
          if (!user2) {
            res.status(404).json({ status: '404', message: `Utilisateur ${userid2} n'a pas d'amis` });
            return;
          }
          const friendDoc1 = await users.findfollowed(userid1);
          console.log("user1: " +friendDoc1);
          const friendDoc2 = await users.findfollowed(userid2);
          console.log("user2: " +friendDoc2);
          //Rechercher les amis en commun
          const friendsIDs1 = friendDoc1.followed;
          const friendsIDs2 = friendDoc2.followed;
          console.log(friendsIDs1);
          console.log(friendsIDs2);
          const commonFriends = friendsIDs1.filter(friendID => friendsIDs2.includes(friendID));
          console.log("COMMON :"+commonFriends);
          res.status(200).json({ commonFriends: commonFriends });  
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });





      //deleteFriend, ne plus suivre l'ami (friendid) de l'utilisateur (userid
      router.delete('/friends/user/:userid/friends/:friendid', async (req, res) => {
        const { userid, friendid } = req.params;
        try {
          if(userid == friendid){
            res.status(400).json({ status: '400', message: 'Les deux utilisateurs reference la même personne' });
            return;
          }
          //Vérifier si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur ${userid} inconnu` });
            return;
          }
          //Vérifier si l'ami existe
          const friend = await users.findUserById(friendid);
          if (!friend) {
            res.status(404).json({ status: '404', message: `Utilisateur ${friendid} inconnu` });
            return;
          }
          //Vérifier si l'userid à des amis
          const friendDoc = await users.findfollowed(userid);
          if(!friendDoc){
            res.status(404).json({ status: '404', message: `Utilisateur ${userid} ne suit personne` });
            return;
          }
          const friendsIDs = friendDoc.followed;//les amis de l'utilisateur
          if(!friendsIDs.includes(friendid)){
            res.status(404).json({ status: '404', message: `Utilisateur ${userid} ne suit pas ${friendid}` });
            return;
          }
          //Supprimer l'utilisateur friendid de la liste followed de l'utilisateur userid
          await users.deletefollowed(userid, friendid);
          //Supprimer l'utilisateur userid de la liste follower de l'utilisateur friendid
          await users.deletefollower(friendid, userid);
          res.status(200).json({ status: '200', message: `Utilisateur ${userid} ne suit plus ${friendid}` });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      //getFriendInfo, renvoie ses relations follower et followed d'un utilisateur userid
      router.get('/friends/user/:userid/infos', async (req, res) => {
        const { userid } = req.params;
        try {
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }

          let followedJSON ={};
          let followerJSON ={};
          let nofriend =false;
          //Vérifier si l'utilisateur à des amis. Si oui, renvoyer la liste des personnes qu'il suit
          const followedDoc = await users.findfollowed(userid);
          if(!followedDoc){
            nofriend=true;
            followedJSON = {followed: "Aucun ami"};
          }
          //Si l'utilisateur à des amis, renvoyer la liste des personnes qu'il suit
          if(!nofriend){
            const followedIDs = followedDoc.followed;
            const followedList = [];
            for (const followedID of followedIDs) {
              const followed = await users.findUserById(followedID);
              if(followed)
                followedList.push(followed.login);
            }
            followedJSON = {followed: followedList.join(', ')};
          }
          nofriend =false;

          //Vérifier si l'utilisateur est suivi. Si oui, renvoyer la liste des personnes qui le suivent
          const followerDoc1 = await users.findfollower(userid);
          if(!followerDoc1){
            nofriend=true;
            followerJSON = {follower: "Aucun followers"};
          }
          //Si l'utilisateur est suivi, renvoyer la liste des personnes qui le suivent
          if(!nofriend){
            const followerIDs = followerDoc1.follower;
            const followerList = [];
            for (const followerID of followerIDs) {
              const follower = await users.findUserById(followerID);
              if(follower)
                followerList.push(follower.login);
            }
            followerJSON = {'follower': followerList.join(', ')};
          }
          //Fusionner les amis de l'utilisateur et les personnes qui le suivent
          const fusion={...followedJSON, ...followerJSON};
          res.status(200).json({fusion});
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //createMessage, creer un msg a partir d'un user (moi) avec userid
      router.post('/messages/user/:userid/messages', async (req, res) => {
        const { userid } = req.params;
        const { message } = req.body;
        try {
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          if(!message){
            res.status(400).json({ status: '400', message: `Message vide` });
            return;
          }
          const id = uuidv4();
          const messageDoc = { id, userid, message };
          const message1 = await users.createMessage(messageDoc);
          res.status(200).json({ status: '200', message: message1, id : id });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });


      //setMessage, modifier un msg a partir d'un user (moi) avec son message id
      router.put('/messages/user/:userid/messages/:messageid', async (req, res) => {
        const { userid, messageid } = req.params;
        const { old_message, new_message } = req.body;
        try{
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Si l'ancien ou le nouveau message est vide
          if(!old_message || !new_message){
            res.status(400).json({ status: '400', message: `Missing Fields` });
            return;
          }
          //Recherche du message grâce a son id
          const message = await users.findMessageById(messageid);
          if(!message){
            res.status(404).json({ status: '404', message: `Message non trouvé` });
            return;
          }
          //Si le message n'appartient pas a l'utilisateur
          if(message.userid != userid){
            res.status(404).json({ status: '404', message: `Le message ${messageid} n'appartient pas à l'utilisateur ${userid}` });
            return;
          }
          //Si l'ancien message et le message de la base de données ne sont pas identiques
          if(old_message != message.message){
            res.status(404).json({ status: '404', message: `Le message ${message.message} n'est pas identique à ${old_message}` });
            return;
          }
          //Modification du message
          await users.updateMessage(messageid, new_message);
          res.status(200).json({ status: '200', message: new_message });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });





      //setMessage2, modifier un msg a partir d'un user (moi) avec son message id
      router.put('/messages/user/:userid/messages2/:messageid', async (req, res) => {
        const { userid, messageid } = req.params;
        const { new_message } = req.body;
        try{
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Si l'ancien ou le nouveau message est vide
          if(!new_message){
            res.status(400).json({ status: '400', message: `Missing Fields` });
            return;
          }
          //Modification du message
          await users.updateMessage(messageid, new_message);
          res.status(200).json({ status: '200', message: new_message });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      
      //deleteMessage, supprimer un msg a partir d'un user (moi) avec son message id
      router.delete('/messages/user/:userid/messages/:messageid', async (req, res) => {
        const { userid, messageid } = req.params;
        const { message } = req.body;
        try{
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          if(!message){
            res.status(400).json({ status: '400', message: `Missing fields` });
            return;
          }
          //Vérifie si le message existe 
          const message1 = await users.findMessageById(messageid);
          if(!message1){
            res.status(404).json({ status: '404', message: `Message non trouvé` });
            return;
          }
          //Vérifie si le message appartient a l'utilisateur
          if(message1.userid != userid){
            res.status(404).json({ status: '404', message: `Le message ${messageid} n'appartient pas à l'utilisateur ${userid}` });
            return;
          }
          //Vérifie si le message est identique a celui de la base de données
          if(message1.message != message){
            res.status(404).json({ status: '401', message: `Le message ${message1.message} n'est pas identique à ${message}` });
            return;
          }
          //Suppression du message
          await users.deleteMessage(messageid,userid);
          res.status(200).json({ status: '200', message: `Message supprimé` });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });





      //deleteMessage2, supprimer un msg a partir d'un user (moi) avec son message id
      router.delete('/messages2/user2/:userid/messages2/:messageid', async (req, res) => {
        const { userid, messageid } = req.params;
        try{
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          const message1 = await users.findMessageById(messageid);
          //Suppression des commentaires du message et le message

          await users.deleteCommentManyByMsgID(messageid);
          await users.deleteMessage(messageid,userid);
          await users.deleteAllPinByMessageID(messageid);
          await users.deleteLikeByMsgID(messageid);
          res.status(200).json({ status: '200', message: `Message supprimé` });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });







      //getListMessage, récupère tous les messages de la base de donnée
      router.get('/messages/messages', async (req, res) => {
        try{
          //Un Array des messages
          const messages = await users.findAllMessages();
          if (!messages) {
            res.status(404).json({ status: '404', message: `Aucun message trouvé` });
            return;
          }
          //Récupération des messages
         /* const messageList =[];
          for (let i=0; i<messages.length; i++){
            messageList.push(messages[i].message);
          }
          res.status(200).json({ status: '200', messages : messageList.join(', ') });*/
          res.status(200).json({ status: '200', messages : messages.reverse() });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });


      //getListMessageFromFriend, récupère les messages d'un ami friendid de l'utilisateur userid
      router.get('/messages/user/:userid/messages/:friendid', async (req, res) => {
        const { userid, friendid } = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si l'ami existe
          const friend = await users.findUserById(friendid);
          if (!friend) {
            res.status(404).json({ status: '404', message: `Ami inconnu` });
            return;
          }
          //Verifie si l'utilisateur userid suit l'user friendid
          const findfollowed = await users.findFriend(userid,friendid);
          if(!findfollowed){
            res.status(404).json({ status: '404', message: `L'utilisateur ${userid} ne suit pas l'utilisateur ${friendid}` });
            return;
          }
          //Récupère les messages de l'utilisateur friendid s'il en a
          const messages1= await users.findAllMessageById(friendid);
          if(!messages1 || messages1.length == 0){
            res.status(404).json({ status: '404', message: `L'utilisateur ${friendid} n'a pas de message` });
            return;
          }
          //Renvoie les messages de l'utilisateur friendid
          const messageList1 =[];
          for (const msg of messages1){
            messageList1.push(msg.message);
          }
          res.status(200).json({ status: '200', messages : messageList1.join(', ') });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      //getListMessageFromAllFriend, récupère les messages de tous les amis de l'utilisateur userid
      router.get('/messages/user/:userid/allmessages/friends', async (req, res) => {
        const { userid } = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          const userfollowed = await users.findfollowed(userid);
          if(!userfollowed || userfollowed.followed.length == 0){
            res.status(404).json({ status: '404', message: `L'utilisateur ${userid} ne suit personne` });
            return;
          }
          //Vérifie si l'utilisateur userid suit l'user friendid
          const userfriendsmessages =[];
          for(let i=0; i<userfollowed.followed.length ; i++){
            const messages = await users.findAllMessageById(userfollowed.followed[i]);
            if(messages && messages.length > 0){
              for(let j=0; j<messages.length; j++){
                userfriendsmessages.push(messages[j].message);
              }
            }
          }
          if(userfriendsmessages.length == 0){
            res.status(404).json({ status: '404', message: `Aucun message trouvé` });
            return;
          }
          res.status(200).json({ status: '200', messages : userfriendsmessages.join(', ') });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });






      //getListMessageInfosFromAllFriend, récupère les ID messages de tous les amis de l'utilisateur userid
      router.get('/messages/user/:userid/allmessagesInfos/friends', async (req, res) => {
        const { userid } = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          const userfollowed = await users.findfollowed(userid);
          if(!userfollowed || userfollowed.followed.length == 0){
            res.status(200).json({ message: `L'utilisateur ${userid} ne suit personne` });
            return;
          }
          //Récupère les messages de tous les amis de l'utilisateur userid
          const userfriendsmessages =[];
          const allmessages = await users.findAllMessages();
          for( m of allmessages){
            if(userfollowed.followed.includes(m.userid) || m.userid == userid){
              userfriendsmessages.push(m);
            }
          }

        /*  if(userfriendsmessages.length == 0){
            res.status(404).json({ status: '404', message: `Aucun message trouvé` });
            return;
          }*/
          res.status(200).json({ status: '200', messages : userfriendsmessages.reverse() });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      

      //getInfoMessageUser, permet de récupérer le nombre de messages d'un utilisateur userid
      router.get('/messages/user/:userid/infos', async (req, res) => {
        const { userid } = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Récupère les messages de l'utilisateur friendid s'il en a
          const messages1= await users.findAllMessageById(userid);
          if(!messages1 || messages1.length == 0){
            res.status(200).json({count : "0"});
            return;
          }
          //Renvoie les messages de l'utilisateur friendid
          res.status(200).json({ count: messages1.length });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //getInfoAllMessage, permet de récupérer le nombre de messages de tous les utilisateurs
      router.get('/messages/infos', async (req, res) => {
        try{
          //Récupère les messages de l'utilisateur friendid s'il en a
          const messages1= await users.findAllMessages();
          if(!messages1 || messages1.length == 0){
            res.status(200).json({count : "0"});
            return;
          }
          //Renvoie le nombre de message dans la base de donnée 
          res.status(200).json({ count: messages1.length });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      //getMessageByWord, permet de récupérer les messages contenant le mot word
      router.get('/messages/word', async (req, res) => {
        const { word } = req.query;
        try{
          const messages1= await users.findAllMessages();
          if(!messages1 || messages1.length == 0){
            res.status(404).json({messages : "vide"});
            return;
          }

          const messages2 = [];
          for(m of messages1){
            msgSplit = m.message.split(" ");
            for( msg of msgSplit){
              if(msg.toLowerCase() == word.toLowerCase()){
                messages2.push(m);
              }
            }
          }

          if(messages2.length == 0){
            res.status(200).json({messages : messages1.reverse()});
            return;
          }

          res.status(200).json({messages : messages2.reverse()});
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      //createPin, permet d'epingler un post/message messageid pour un userid
      router.post('/pin/user/:userid/pin/:messageid', async (req, res) => {
        const { userid, messageid } = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si le message existe
          const message = await users.findMessageById(messageid);
          if (!message) {
            res.status(404).json({ status: '404', message: `Message inconnu` });
            return;
          }
          //Vérifie si le message est déjà épinglé
          const findpin = await users.findPin(userid,messageid);
          if(findpin){
            res.status(404).json({ status: '404', message: `Le message ${messageid} est déjà épinglé` });
            return;
          }
          //Créé le pin
          await users.createPin(userid,messageid);
          res.status(200).json({ status: '200', message: `Le message ${messageid} a été épinglé` });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //deletePin, supprime un message épinglé avec pinid et son userid
      router.delete('/pin/user/:userid/pin/:pinid', async (req, res) => {
        const { userid, pinid } = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si le pin existe
          const pin = await users.findPinById(pinid);
          if (!pin) {
            res.status(404).json({ status: '404', message: `Message épinglé inexistant` });
            return;
          }
          //Vérifie si le message du pin existe dans la collection message
          const message = await users.findMessageById(pin.messageID);
          if (!message) {
            res.status(404).json({ status: '404', message: `Message inexistant` });
            return;
          }
          await users.deletePin(pinid);
          res.status(200).json({ status: '200', message: `Le pin ${pinid} a été dépinglé` });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      //deletePin2, supprime un message/commentaire épinglé avec msg_comment_id et son userid
      router.delete('/pin2/user/:userid/pin/:msg_comment_id', async (req, res) => {
        const { userid, msg_comment_id } = req.params;
        try{

          await users.deletePin2(userid,msg_comment_id);
          res.status(200).json({ status: '200', message: `Le message ${msg_comment_id} a été dépinglé`, pinned: false });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //createPin2, permet d'epingler un message/commentaire msg_comment_id pour un userid
      router.post('/pin2/user/:userid/pin/:msg_comment_id', async (req, res) => {
        const { userid, msg_comment_id } = req.params;
        console.log("API PIN");
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si le message existe
          const message = await users.findMessageComment(msg_comment_id);
          if (!message) {
            res.status(404).json({ status: '404', message: `Message/Commentaire inconnu` });
            return;
          }

          //Créé le pin
          await users.createPin(userid,msg_comment_id);
          res.status(200).json({ status: '200', message: `Le message ${msg_comment_id} a été épinglé`, pinned : true });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //getPinnedInfos, permet d'epingler un message/commentaire msg_comment_id pour un userid
      router.get('/pin/user/:userid/pin/:msg_comment_id/pinned', async (req, res) => {
        const { userid, msg_comment_id } = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si le message existe
          const message = await users.findMessageComment(msg_comment_id);
          if (!message) {
            res.status(404).json({ status: '404', message: `Message/commentaire inconnu` });
            return;
          }
          //Vérifie si le message est épinglé
          const pin = await users.findPin2(userid,msg_comment_id);

          if(pin){
            res.status(200).json({ status: '200', message: `Le message ${msg_comment_id} est épinglé`, pinned : true });
            return;
          }
          else{
            res.status(200).json({ status: '200', message: `Le message ${msg_comment_id} n'est pas épinglé`, pinned : false });
            return;
          }
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      //getAllPinByUser, permet de recupérer tous les messages épinglés par un utilisateur
      router.get('/pin/user/:userid', async (req, res) => {
        const {userid} = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Récupère tous les pins de l'utilisateur
          const pins = await users.findAllPinByUser(userid);
          if(pins.length == 0){
            res.status(200).json({ status: '200', message: `L'utilisateur ${userid} n'a pas de message épinglé` });
            return;
          }

          messageList = [];
          for (let i = 0; i < pins.length; i++) {
            const message = await users.findMessageById(pins[i].messageID);
            messageList.push(message);
          }
          res.status(200).json({ status: '200', message: `L'utilisateur ${userid} a des messages épinglés`, messageList });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });




      //createComment, permet de créer un commentaire pour un message messageid (qui est un post)
      router.post('/comment/user/:userid/message/:messageid/:commentIDAuthor', async (req, res) => {
        const { userid, messageid, commentIDAuthor } = req.params;
        const { comment } = req.body;
        try{
          if(!comment){
            res.status(404).json({ status: '404', message: `Missing Field` });
            return;
          }
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si le message existe
          const message = await users.findMessageById(messageid);
          if (!message) {
            res.status(404).json({ status: '404', message: `Message inconnu` });
            return;
          }
          //Vérifie si l'auteur du commentaire existe
          const commentIDAuthorUser = await users.findUserById(commentIDAuthor);
          if (!commentIDAuthorUser) {
            res.status(404).json({ status: '404', message: `Auteur du commentaire inconnu` });
            return;
          }
          const comment1 = await users.createComment(userid,messageid,comment,commentIDAuthor);
          res.status(200).json({ status: '200', comment: comment1 });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });


      //deleteComment, permet de supprimer un commentaire avec son commentid
      router.delete('/comment/user/:userid/message/:messageid/:commentIDAuthor/:commentid', async (req, res) => {
        const { userid, messageid, commentIDAuthor , commentid } = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si le message existe
          const message = await users.findMessageById(messageid);
          if (!message) {
            res.status(404).json({ status: '404', message: `Message inconnu` });
            return;
          }
          //Vérifie si l'auteur du commentaire existe
          const commentIDAuthorUser = await users.findUserById(commentIDAuthor);
          if (!commentIDAuthorUser) {
            res.status(404).json({ status: '404', message: `Auteur du commentaire inconnu` });
            return;
          }
          //Vérifie si le messageid appartient bien a l'utilisateur userid
          if(message.userid != userid){
            res.status(404).json({ status: '404', message: `Le message ${messageid} n'appartient pas à l'utilisateur ${userid}` });
            return;
          }
          //Vérifie si le commentaire existe
          const comment = await users.findComment(commentid,userid,messageid,commentIDAuthor);
          if (!comment) {
            res.status(404).json({ status: '404', message: `Commentaire non trouvé` });
            return;
          }
          await users.deleteComment(commentid);
          res.status(200).json({ status: '200', message: `Le commentaire a été supprimé` });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        } 
      });





      //deleteComment2, permet de supprimer un commentaire avec son commentid
      router.delete('/comment2/user/:commentIDAuthor/:commentid', async (req, res) => {
        const { commentIDAuthor , commentid } = req.params;
        try{
 
          //Vérifie si l'auteur du commentaire existe
          const commentIDAuthorUser = await users.findUserById(commentIDAuthor);
          if (!commentIDAuthorUser) {
            res.status(404).json({ status: '404', message: `Auteur du commentaire inconnu` });
            return;
          }

          await users.deleteComment(commentid);
          await users.deleteLikeByMsgID(commentid);
          res.status(200).json({ status: '200', message: `Le commentaire a été supprimé` });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        } 
      });






      //setComment, permet de modifier un commentaire
      router.put('/comment/user/:userid/message/:messageid/:commentIDAuthor', async (req, res) => {
        const { userid, messageid, commentIDAuthor } = req.params;
        try{
          if(!req.body.comment){
            res.status(404).json({ status: '404', message: `Missing Field` });
            return;
          }
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si le message existe
          const message = await users.findMessageById(messageid);
          console.log(message);
          if (!message) {
            res.status(404).json({ status: '404', message: `Message inconnu` });
            return;
          }
          //Vérifie si l'auteur du commentaire existe
          const commentIDAuthorUser = await users.findUserById(commentIDAuthor);
          if (!commentIDAuthorUser) {
            res.status(404).json({ status: '404', message: `Auteur du commentaire inconnu` });
            return;
          }
          //Vérifie si le messageid appartient a l'userid
          if(message.userid != userid){
            res.status(404).json({ status: '404', message: `Le message ${messageid} n'appartient pas à l'utilisateur ${userid}` });
            return;
          }
          await users.updateComment(userid, messageid, commentIDAuthor, req.body.comment);
          res.status(200).json({ status: '200', comment : req.body.comment });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });






      //setComment2, permet de modifier un commentaire
      router.put('/comment/user/:userid/comment2/:commentid', async (req, res) => {
        const { userid, commentid } = req.params;
        const { new_comment }= req.body;
        try{
          if(!new_comment){
            res.status(404).json({ status: '404', message: `Missing Field` });
            return;
          }
          const user = await users.findUserById(userid);
          if (!user) {
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }

          //modification du commentaire
          await users.updateComment2(commentid, new_comment);
          res.status(200).json({ status: '200', comment : new_comment });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });





      //getListComment, permet de récupérer la liste des commentaires d'un message
      router.get('/comments/comments', async (req, res) => {
        try{
          //Un Array des commentaires d'un message
          const comments = await users.findAllComments();
          if (!comments) {
            res.status(404).json({ status: '404', comments: `Aucun commentaire trouvé` });
            return;
          }
          res.status(200).json({ status: '200', comments : comments });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //createLike, creation d'un like, msg_comment_id est l'id d'un message ou d'un commentaire
      router.post('/like/user/:userid/:msg_comment_id', async (req, res) => {
        const { userid, msg_comment_id} = req.params;

        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid)
          if( !user ){
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si l'utilisateur a déjà liké ou non
          const like = await users.findLike(userid, msg_comment_id);
          if( like ){
            res.status(404).json({ status: '404', message: `Vous avez déjà liké ce message ou commentaire`, liked:true });
            return;
          }
          //Vérifie si c'est un message liké
          const msg = await users.findMessageById(msg_comment_id);
          if( msg){
            await users.addLike(userid, msg_comment_id);
            res.status(200).json({ status: '200', message: `Le like a été créé sur le post`, liked : true });
            return;
          }
          //Vérifie si c'est un commentaire liké
          const comment = await users.findCommentById(msg_comment_id);
          if( comment ){
            await users.addLike(userid, msg_comment_id);
            res.status(200).json({ status: '200', message: `Le like a été créé sur le commentaire` , liked : true});
            return;
          }
          else{
            res.status(404).json({ status: '404', message: `Message ou commentaire inconnu` });
            return;
          }
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //getLikedInfos, vérifie si le message ou commentaire a déja été liké
      router.get('/like/user/:userid/:msg_comment_id/liked', async (req, res) => {
        const { userid, msg_comment_id} = req.params;

        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid)
          if( !user ){
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si l'utilisateur a déjà liké ou non
          const like = await users.findLike(userid, msg_comment_id);
          if( like ){
            res.status(200).json({message: `Vous avez déjà liké ce message ou commentaire`, liked:true });
            return;
          }
          else{
            res.status(200).json({message: `Message ou commentaire inconnu`, liked : false });
            return;
          }
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });





      //deleteLike, suppression d'un like, msg_comment_id est l'id d'un message ou d'un commentaire
      router.delete('/like/user/:userid/:msg_comment_id', async (req, res) => {
        const { userid, msg_comment_id} = req.params;
        try{
          const user = await users.findUserById(userid)
          if( !user ){
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si le message à bien le like de l'userid
          const msg = await users.findMessageById(msg_comment_id);
          const like = await users.findLike(userid, msg_comment_id);
          if( msg && like){
            await users.deleteLike(userid, msg_comment_id);
            res.status(200).json({ status: '200', message: `Le like a été supprimé sur le post` , liked: false});
            return;
          }
          //Vérifie si le commentaire à bien le like de l'userid
          const comment = await users.findCommentById(msg_comment_id);
          if( comment && like){
            await users.deleteLike(userid, msg_comment_id);
            res.status(200).json({ status: '200', message: `Le like a été supprimé sur le commentaire` , liked:false });
            return;
          }
          else{
            res.status(404).json({ status: '404', message: `Pas de like de la part de l'utilisateur ${userid}` });
            return;
          }

        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //getInfoLike, compter le nombre de like d'un message ou d'un commentaire
      router.get('/like/:msg_comment_id/infos', async (req, res) => {
        const { msg_comment_id} = req.params;
        try{
          const likes = await users.countLikes(msg_comment_id);
          res.status(200).json({ count : likes });}
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });


      

      //addPic
      router.put('/pic/:picName/:userid', async (req, res) => {
        const { picName,userid } = req.params;

        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid);
          if( !user ){
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si l'utilisateur a déjà une photo de profil
          await users.addPicture(userid,picName);
          console.log("La photo de profil a été ajoutée")
          res.status(200).json({ status: '200', message: `La photo de profil a été ajoutée` });
          return;
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });

      //getPic, récupère la photo de profil d'un utilisateur
      router.get('/pic/:userid', async (req, res) => {
        const { userid } = req.params;
        try{
          //Vérifie si l'utilisateur existe
          const user = await users.findUserById(userid)
          if( !user ){
            res.status(404).json({ status: '404', message: `Utilisateur inconnu` });
            return;
          }
          //Vérifie si l'utilisateur a déjà une photo de profil
          const user1 = await users.getPicture(userid);
          res.status(200).json({ picname : user1.picture });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //getInfoAllComments, récupère tous les commentaires de la base de données
      router.get('/allcomments/infos', async (req, res) => {
        try{
          const comments = await users.findAllComments();
          res.status(200).json({ count : comments.length });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });

      //getInfoAllLikes, récupère tous les likes de la base de données
      router.get('/alllikes/infos', async (req, res) => {
        try{
          const likes = await users.getCountAllLikes();
          res.status(200).json({ count : likes });
          
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });



      //getInfoAllPins, récupère tous les pins de la base de données
      router.get('/allpins/infos', async (req, res) => {
        try{
          const pins = await users.getAllPins();
          res.status(200).json({ count : pins.length });
        }
        catch (err) {
          res.status(500).json({ status: '500', message: 'Erreur interne' });
        }
      });
      


    //NE PAS TOUCHER SVP
    return router;
}

exports.default = init;
