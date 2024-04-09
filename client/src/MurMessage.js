import { useEffect, useState } from 'react';
import './MurMessage.css';
import logo from './logo.png'
import home_page from './home_page.png'
import photo_profile from './photo_profile.jpg'
import personne from './personne.png'
import personnes from './personnes.png'
import pin from './pin.png'
import SearchBar from './SearchBar';
import Disconnect_button from './Disconnect_Button';
import Friend from './Friend';
import PostsList from './PostsList';
import axios from 'axios';


const path_picture= require.context('./pictures',true);

function MurMessage (props) {//{id,logout,profil,setID}
    //id, l'id de l'utilisateur connecté
    //logout, pouvoir se déconnecter
    //profil, pouvoir aller sur le profil
    //setID, pouvoir changer l'id de l'utilisateur connecté

    const [id,setId] = useState(props.id);//id de l'utilisateur connecté
    const [friendsListID, setFriendsListID] = useState([]);//Liste ID des amis de l'utilisateur connecté
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [wordSearch, setWordSearch] = useState("");//Mot recherché

    const [number,setNumber] = useState("0");//0: tous les messages, 1: messages des amis
    const [messagesList, setMessagesList] = useState([]);//Liste des messages

    const [refresh, setRefresh] = useState(false);
    const [refresh2, setRefresh2] = useState(false);
    const [refresh3, setRefresh3] = useState(false);

    useEffect(() => {//getUser, Trouver l'utilisateur qui a posté le message
        axios.get(`http://localhost:4000/api/user/${id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const user = res.data;
                setFirstname(user.user.firstname);
                setLastname(user.user.lastname);

            })
            .catch(err => {
                console.log(err);
            })
    
    },[]);



    useEffect(() => {
        console.log("Messages List updated"); // vérifiez si le composant se réactualise correctement
        console.log(number);
    }, [number]);




    useEffect(() => {//getListMessage, Recupérer tous les messages de la base de données
        axios.get(`http://localhost:4000/api/messages/messages`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                if(number=="0"){
                    const messages = res.data.messages;
                    setMessagesList(messages);
                    setRefresh2(!refresh2);
                }
            })
            .catch(err => {
                console.log(err);
            })
    
    },[number,refresh]);




    useEffect(() => {//getListMessageInfosFromAllFriend, Recupérer tous les messages des amis
        axios.get(`http://localhost:4000/api/messages/user/${id}/allmessagesInfos/friends`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                if(number=="1"){
                    const messages = res.data.messages;
                    setMessagesList(messages);
                }
            })
            .catch(err => {
                console.log(err);
            })
    
    },[number,refresh]);





    useEffect(() => { //getListFriendsID, Obtenir la liste ID d'ami d'un utilisateur userid
        axios.get(`http://localhost:4000/api/friends/user/${id}/friendsID`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const friends = res.data.friendsID;
                setFriendsListID(friends);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[]);

    

    const [picname,setPicName] = useState("");
    const [picPath,setPicPath] = useState("");


    useEffect(() => { //getPic, Récuperer l'image de l'utilisateur
        axios.get(`http://localhost:4000/api/pic/${id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setPicName(res.data.picname );
                
                const  profil_pic = path_picture(`./${res.data.picname}.png`);
                
                setPicPath(profil_pic);
            })
            .catch(err => {
                console.log(err);
            })
    },[]);



    /*Récupérer les infos Chiffres*/

    const [numberUsers,setNumberUsers] = useState(0);
    useEffect(() => { //getUserInfo, Récuperer le nombre d'utilisateur total
        axios.get(`http://localhost:4000/api/user/infos`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setNumberUsers(res.data.count);
            })
            .catch(err => {
                console.log(err);
            })
    },[]);

    const [numberMessages,setNumberMessages] = useState(0);
    useEffect(() => { //getInfoAllMessage, Récuperer le nombre de message total
        axios.get(`http://localhost:4000/api/messages/infos`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setNumberMessages(res.data.count);
            })
            .catch(err => {
                console.log(err);
            })
    },[refresh]);

    const [numberComments,setNumberComments] = useState(0);
    useEffect(() => { //getInfoAllComments, Récuperer le nombre de commentaire total
        axios.get(`http://localhost:4000/api/allcomments/infos`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setNumberComments(res.data.count);
            })
            .catch(err => {
                console.log(err);
            })
    },[refresh3]);

    const[refresh4,setRefresh4] = useState(false);
    const [numberLikes,setNumberLikes] = useState(0);
    useEffect(() => { //getInfoAllLikes, Récuperer le nombre de likes total
        axios.get(`http://localhost:4000/api/alllikes/infos`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setNumberLikes(res.data.count);
            })
            .catch(err => {
                console.log(err);
            })
    },[refresh4]);

    const [refresh5,setRefresh5] = useState(false);
    const [numberPins,setNumberPins] = useState(0);
    useEffect(() => { //getInfoAllPins, Récuperer le nombre de message épinglé total
        axios.get(`http://localhost:4000/api/allpins/infos`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setNumberPins(res.data.count);
            })
            .catch(err => {
                console.log(err);
            })
    },[refresh5]);




    return (
        <body id="body_mur">
            <header id="header_mur">
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="logo_size_mur" src={logo} alt="Main Logo"/></button>   
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="home_page_mur" src={home_page} alt="home page" /></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="profil1_mur" src={personne} alt="personne" onClick={props.profil}/></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="personne_mur" src={personnes} alt="personne" onClick={props.getAllUsers}/></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="pin_mur" src={pin} alt="pin" onClick={props.getPin}/></button>
                <div id="mur_search_bar">
                    <SearchBar setNumber={setNumber} setWordSearch={setWordSearch} setMessagesList={setMessagesList} ></SearchBar>
                </div>

                <div id="disconnect" >
                    <Disconnect_button logout={props.logout} idd={props.id}></Disconnect_button>
                </div>

            </header>

            <main id="main_mur"> 
                <aside>
                    <div id="profile_picture_mur">

                        <img id="profile_pic_mur" src={picPath} alt="main picture" />
                        
                        <div id="profile_mur">
                        <button id="my_profile_mur" type="submit" onClick={props.profil} >{firstname} {lastname}</button>
                        
                        </div>

                        <div id="friends_list_mur">
                            <p id="friends_list_title"> Mes Amis </p>
                            <div>
                                <ul>
                                {friendsListID.map((friend) => (
                                    <li><Friend id={friend} getFriend={props.friend} ></Friend></li>
                                ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                </aside>         

                <section id="section_mur">
                    <div id="messages_mur">
                        <PostsList id={id} number={number} setMessagesList={setMessagesList}  messagesList={messagesList} refresh={refresh} setRefresh={setRefresh} refresh2={refresh2} refresh3={refresh3} setRefresh3={setRefresh3} refresh4={refresh4} setRefresh4={setRefresh4} refresh5={refresh5} setRefresh5={setRefresh5}></PostsList>          
                    </div>
                </section>
                <div id="section_stats">
                    <h2 id="title_stats">Chiffres</h2>
                        <ul id="valeur_stats" style={{width :"300px"}}>
                            <li id="infos_stats"><strong><u>Utilisateurs :</u></strong> {numberUsers}</li>
                            <li id="infos_stats"><strong><u>Posts :</u></strong> {numberMessages}</li>
                            <li id="infos_stats"><strong><u>Commentaires :</u></strong> {numberComments}</li>
                            <li id="infos_stats"><strong><u>Likes :</u></strong> {numberLikes}</li>
                            <li id="infos_stats"><strong><u>Posts épinglés :</u></strong> {numberPins}</li>
                            
                        </ul>
                </div>
                    
            </main>
        </body>
    );
}

export default MurMessage;