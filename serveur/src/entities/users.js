//const { client } = require('../app');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const moment = require('moment');
const now = moment().locale('fr');
require('moment/locale/fr');

class Users {
  constructor(db) {
    this.db = db;
    this.userCollection = db.collection("utilisateur");
    this.followedCollection = db.collection("followed");
    this.followerCollection = db.collection("follower");
    this.messageCollection = db.collection("message");
    this.pinnedCollection = db.collection("pinned");
    this.commentCollection = db.collection("comment");
    this.likeCollection = db.collection("like");

  }
  //Hasher un mot de passe
  async hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  //Vérifier le mot de passe haché 
  async checkPassword(login, password) {
    const user = await this.userCollection.findOne({ login: login });
    if (user) {
      const pass = await bcrypt.compare(password, user.password);
      return pass ? user.id : null;
    }
    return null;
  }


  // Fonction pour trouver un utilisateur par son login et son mot de passe
  async findUser(login) {
    const result = await this.userCollection.findOne({ login: login });
    return result;
  }
    
  // Fonction pour mettre à jour les informations d'un utilisateur (connexion et ID de session)
  async updateUser(userId, isLogged) {
    await this.userCollection.updateOne({ id: userId }, { $set: { isLogged : isLogged} });
    return;
  }

  //Ajouter un utilisateur
  async addUser(login, password, confirmpassword, lastname, firstname) {

    const exist = await this.userCollection.findOne({ login: login });
    if (exist) {
      throw new Error('Utilisateur existe déjà');
    }

    const id = uuidv4();
    const newUser = { id, login, password, confirmpassword, lastname, firstname, picture:"boeuf" };
    const result = await this.userCollection.insertOne(newUser);
    return result;
  }
  
  //Trouver un utilisateur par son ID dans la collection utilisateur
  async findUserById(userId) {
    return await this.userCollection.findOne({ id: userId });

  }

  //Mise a jour, deconnexion d'un utilisateur avec userid
  async updateDisconnect(userid, isLogged){
      const user = await this.userCollection.findOne({ id: userid });
      if (!user) {
        throw new Error('Utilisateur inexistant');
      }
      this.updateUser(userid, isLogged);
      return;
  }

  //Suppression d'un utilisateur avec userid
  async deleteUser(userid){
    const user = await this.userCollection.findOne({ id: userid });
    if (!user) {
      throw new Error('Utilisateur inexistant');
    }
    await this.userCollection.deleteOne({ id: userid });
    return;
  }

  //Compter le nombre d'utilisateurs
  async countUsers(){
    return await this.userCollection.countDocuments();
  }

  async getAllUsers(){
    return await this.userCollection.find().toArray();
  }

  async getAllUsersExceptMe(userid){
    return await this.userCollection.find({ id: { $ne: userid } }).toArray();
  }



//DEBUT DES SERVICES LIÉS AUX AMIES

  //Trouver un utilisateur par son login dans la collection utilisateur
  async findUserByLogin(login) {
    return await this.userCollection.findOne({ login: login });
    
  }

  //Trouver un ami par son friendid dans la collection followed, avec l'utilisateur userid
  async findFriend(userid, friendid){
    return await this.followedCollection.findOne({ id: userid, followed: friendid });
  }

  //Ajouter un ami dans la collection followed, à l'utilisateur userid
  async addfollowed(userid, friendid){
    await this.followedCollection.updateOne( {id: userid}, 
    { $push: { followed: friendid } },
    { upsert: true })
    return;
  };

  //Ajouter une personne userid qui suit friendid dans la collection follower
  async addfollower(userid, friendid){
    await this.followerCollection.updateOne( {id: friendid}, 
    { $push: { follower: userid } },
    { upsert: true })
    return;
  };

  //Trouver tous les amis d'un utilisateur userid
  async findfollowed(userid){
    return await this.followedCollection.findOne({ id: userid });
  }

  //Trouver tous les followers d'un utilisateur userid
  async findfollower(userid){
    return await this.followerCollection.findOne({ id: userid });
  }

  //Supprimer un ami friendid de la collection followed de l'utilisateur userid
  async deletefollowed(userid, friendid){
    await this.followedCollection.updateOne( {id: userid}, 
      { $pull: { followed: friendid } })
    return;
  };

  //Supprimer un follower userid de la collection follower de l'utilisateur friendid
  async deletefollower(userid, friendid){
    await this.followerCollection.updateOne( {id: userid}, 
      { $pull: { follower: friendid } })
    return;
  }


  //DEBUT DES SERVICES LIÉS AUX MESSAGES

  //Créer un message dans la collection message, avec son id, l'userid (le createur), le message et la date
  async createMessage(messageDoc){
    const { id, userid, message } = messageDoc;
    const date = now.format('DD MMMM YYYY '+"à"+' HH:mm');
    const messageDate = date;
   // const messageDate = `${date}`;
    const newMessage = { id,userid, message, messageDate  };
    await this.messageCollection.insertOne(newMessage);
    return await this.messageCollection.findOne({ id: id });
  }

  //Trouver un message par son id dans la collection message
  async findMessageById(messageid){
    return this.messageCollection.findOne({ id: messageid });
  }

  //Mettre à jour un message par son id dans la collection message
  async updateMessage(messageid, message){  
    await this.messageCollection.updateOne({id : messageid},
      {$set : {message : message}});
    return;
  }

  //Supprimer un message par son id dans la collection message
  async deleteMessage(messageid,userid){
    await this.messageCollection.deleteOne({ id: messageid, userid: userid });
    return;
  }

  //Trouver tous les messages dans la collection message
  async findAllMessages(){
    return await this.messageCollection.find().toArray();
  }

  //Trouver tous les messages d'un utilisateur userid dans la collection message
  async findAllMessageById(userid){
    return await this.messageCollection.find({ userid: userid }).toArray();
  }

  //Trouver tous les amis d'un utilisateur userid dans la collection followed
  async findAllFriends(userid){
    return await this.followedCollection.find({ id: userid }).toArray();
  }

  //Trouver tous les messages de sa collection
  async findAllMessages(){
    return await this.messageCollection.find().toArray();
  }



  //DEBUT DES SERVICES LIÉS AUX PINNED

  //Trouver un message épinglé par l'id de l'utilisateur et du messageid dans la collection pinned
  async findPin(userid, messageid){
    return this.pinnedCollection.findOne({ userid: userid, messageID: messageid });
  }

  //Créer un message épinglé dans la collection pinned, avec son userid (propriétaire du message), le messageid et la date
  async createPin(userid, messageid){
    const id = uuidv4();
    const date = now.format('DD MMMM YYYY '+"à"+' HH:mm');
    const pinDate = date;
    //const pinDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    const newPin = { id : id, userid : userid , messageID: messageid, date : pinDate };
    await this.pinnedCollection.insertOne(newPin);
    return ;
  }

  //Trouver tous les messages épinglés par son id dans la collection pinned
  async findPinById(pinid){
    return await this.pinnedCollection.findOne({ id: pinid });
  }

  //Supprimer un message épinglé par son id dans la collection pinned
  async deletePin(pinid){
    await this.pinnedCollection.deleteOne({ id: pinid });
    return;
  }


  async deletePin2(userid, messageid){
    await this.pinnedCollection.deleteOne({ userid: userid, messageID: messageid });
    return;
  }

  async findPin2(userid, messageid){
    return this.pinnedCollection.findOne({ userid: userid, messageID: messageid });
  }


  async findAllPinByUser(userid){
    return await this.pinnedCollection.find({ userid: userid }).toArray();
  }

  async deleteAllPinByMessageID(messageid){
    await this.pinnedCollection.deleteMany({ messageID: messageid });
    return;
  }

  async getAllPins(){
    return await this.pinnedCollection.find().toArray();
  }

  //DEBUT DES SERVICES LIÉS AUX COMMENTAIRES

  //Créer un commentaire dans la collection comment, avec son id, l'userid (propriétaire du messsage), le messageid, le commentaire, l'id de l'auteur du commentaire et la date
  async createComment(userid,messageid,comment,commentIDAuthor){
    const id = uuidv4();
    const date = now.format('DD MMMM YYYY '+"à"+' HH:mm');
    const commentDate = date;
    //const commentDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    const newComment = { id : id, userid : userid , messageID: messageid,  commentIDAuthor : commentIDAuthor, commentDate : commentDate, comment : comment };
    await this.commentCollection.insertOne(newComment);
    return await this.commentCollection.findOne({ id: id });
  }

  //Supprimer un commentaire id dans la collection comment
  async deleteComment(commentid){
    await this.commentCollection.deleteOne({ id: commentid });
    return;
  }

  
  async deleteCommentManyByMsgID(messageid){
    const allComments= await this.commentCollection.find({ messageID: messageid }).toArray();
    for (let i = 0; i < allComments.length; i++) {
      await this.likeCollection.deleteMany({ id: allComments[i].id });
    }
    await this.commentCollection.deleteMany({ messageID: messageid });
    await this.likeCollection.deleteOne({ id: messageid });
    return allComments;
  }

  //Trouver le commentaire en fonction l'id du commentaire dans la collection comment
  async findCommentById(commentID){
    return await this.commentCollection.findOne({ id: commentID });
  }

  //Mise à jour d'un commentaire
  async updateComment(userid,messageid,commentIDAuthor,comment){
    await this.commentCollection.updateOne({userid : userid, messageID : messageid, commentIDAuthor : commentIDAuthor},
      {$set : {comment : comment}});
    return;
  }


  async updateComment2(commentid,comment){
    await this.commentCollection.updateOne({id : commentid},
      { $set: { comment: comment } });
    return;
  }




  //Trouver le commentaire avec son id, l'userid, le messageid et l'id de l'auteur du commentaire dans la collection comment
  async findComment(commentid,userid,messageid,commentIDAuthor){
    return await this.commentCollection.findOne({ id: commentid, userid: userid, messageID: messageid, commentIDAuthor : commentIDAuthor });
  }

  //Trouver tous les commentaires
  async findAllComments(){
    return await this.commentCollection.find().toArray();
  }



  //DEBUT DES SERVICES LIÉS AUX LIKES

  //Ajouter un like
  async addLike(userid,msg_comment_id){
    await this.likeCollection.updateOne({id : msg_comment_id},
      {$push : {likes : userid}},
      { upsert: true });
    return;
  }

  //Supprimer un like
  async deleteLike(userid,msg_comment_id){
    await this.likeCollection.updateOne({id : msg_comment_id},
      {$pull : {likes : userid}});
    return;
  }

  //Trouver l'existance d'un like
  async findLike(userid,msg_comment_id){
    return await this.likeCollection.findOne({ id: msg_comment_id, likes: userid });
  }

  //Compter le nombre de like
  async countLikes(msg_comment_id){
    const tmp = await this.likeCollection.findOne({ id: msg_comment_id });
    return tmp != null ? tmp.likes.length : 0;
  }

  //Vérifier l'existence du commentaire/message
  async findMessageComment(msg_comment_id){
    let c = this.findCommentById(msg_comment_id);
    console.log("comment"+ c);
    let m = this.findMessageById(msg_comment_id);
    return m ? m : (c ? c : 0);
  }

  async deleteLikeByMsgID(messageid){
    await this.likeCollection.deleteMany({ id: messageid });
    return;
  }

  async getCountAllLikes(){
    const likes = await this.likeCollection.find().toArray();
    let count = 0;
    for(let i = 0; i < likes.length; i++){
      count += likes[i].likes.length;
    }
    console.log("--------------------"+count);
    return count;

  }


  //DEBUT DES SERVICES LIÉS AUX PICTURES

  async addPicture(userid, picture){
    await this.userCollection.updateOne({id : userid},
      {$set : {picture : picture}});
    return;
  }


  async getPicture(userid){
    return await this.userCollection.findOne({id : userid});
  }




}

exports.default = Users;
