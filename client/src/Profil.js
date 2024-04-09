import React from 'react';
import { useState,useEffect } from 'react';
import axios from 'axios';

import logo from './logo.png'
import home_page from './home_page.png'
import photo_profile from './photo_profile.jpg'
import personnes from './personnes.png'
import pin from './pin.png'
import './Profil.css';
import SearchBar from './SearchBar';
import Friend from './Friend';
import Disconnect_button from './Disconnect_Button';
import PostsListProfil from './PostsListProfil';

const path_picture= require.context('./pictures',true);

function Profil(props){
    //props.id, id de l'utilisateur connecté
    //props.logout, fonction qui permet de se déconnecter
    //props.getAllUsers, fonction qui permet d'aller sur la page de tous les utilisateurs
    //props.getPin, fonction qui permet d'aller sur la page des messages épinglés
    //props.getFriend, fonction qui permet d'aller sur le mur de l'ami
    //props.page, page actuelle

    const [id,setId] = useState(props.id); //id de l'utilisateur connecté
    const [friendsList, setFriendsList] = useState([]); //liste des amis
    const [followersList,setFollowersList] = useState([]); //liste des followers
    const [list,setList] = useState("friends"); //liste à afficher, amis ou followers

    const [wordSearch, setWordSearch] = useState("");//Mot recherché

    const changeList = (e) => {setList(e);};


    useEffect(() => {//getListFollowersID, Récupérer la liste des followers
        axios.get(`http://localhost:4000/api/friends/user/${id}/followersID`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const followers = res.data.followersID;

                setFollowersList(followers);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[props.page]);






    useEffect(() => {//getListFriendsID, Récupérer la liste des amis
        axios.get(`http://localhost:4000/api/friends/user/${id}/friendsID`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
             //   console.log("RES: "+res.data.friendsID);
                const friends = res.data.friendsID;
             //   console.log("FRIENDS IDs : "+friends);

                setFriendsList(friends);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[props.page]);

    const [picname,setPicName] = useState("");
    const [editpicture,setEditPicture] = useState(false);
    const [picSeclected,setPicSelected] = useState(false);
    const [picPath,setPicPath] = useState("");
    const [picSave,setPicSave] = useState(false);


    const cancel_edit_picture = () => {
        setEditPicture(false);
        setPicSelected(false);
    }

    const choose_picture = (e) => {
        setPicName(e.target.id);
        setPicSelected(true);   
       // console.log("picname : "+e.target.id);
    }


    const save_picture = () => { //addPic, enregistrer la photo de profil
       // console.log("save picture, picname : "+picname+" id : "+id);
        axios.put(`http://localhost:4000/api/pic/${picname}/${id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setEditPicture(false);
                setPicSelected(false);
                setPicSave(!picSave);
            })
            .catch(err => {
                console.log(err);
                
            })
    }


    useEffect(() => { //getPic, Récupérer la photo de profil
        axios.get(`http://localhost:4000/api/pic/${id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setPicName(res.data.picname );
                //const profil_pic = require (`./pictures/${res.data.picname}.png`);
                const  profil_pic = path_picture(`./${res.data.picname}.png`);
                setPicPath(profil_pic);
            })
            .catch(err => {
                console.log(err);
            })
    },[picSave]);


    




    return (
        <body id="body_profil">
            <header id="header_profil">
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="logo_size" src={logo} alt="Main Logo" onClick={props.mur} /></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="home_page_profil" src={home_page} alt="home page" onClick={props.mur}/></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="personne_profil" src={personnes} alt="personne" onClick={props.getAllUsers}/></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="pin_profil" src={pin} alt="pin" onClick={props.getPin}/></button>

                <div id="profil_search_bar">
                    <SearchBar page={props.page} setWordSearch={setWordSearch} ></SearchBar>
                </div>
                
                <div id="disconnect" >
                    <Disconnect_button id="disconnect_profil" logout={props.logout} idd={props.id}></Disconnect_button>
                </div>

            </header>
            <main id="main_profil"> 
                <aside id="friends_list_profil">
                    <button onClick={() => changeList("friends")} id="friends_button_profil1" >Friends</button>
                    <button onClick={() => changeList("followers")} id="followers_button_profil1" >Abonnés</button>
                    {list==="friends" && (
                        <div>
                            <p id="friends_list_title_profil"> Amis </p>
                            <div>
                                <ul>
                                {friendsList.map((friend) => (
                                    <li><Friend id={friend} page={props.page} getFriend={props.getFriend}></Friend></li>
                                ))}
                                </ul>
                            </div>
                        </div>
                    ) }

                    {list==="followers" && (
                        <div>
                            <p id="followers_list_title_profil"> Abonnés </p>
                            <div>
                                <ul>
                                {followersList.map((follower) => (
                                    <li><Friend id={follower} getFriend={props.getFriend} page={props.page} ></Friend></li>
                                ))}
                                </ul>
                            </div>
                        </div>
                    ) }


                </aside>

                <div id="profile_picture_profil">   
                    
                    <img id="profile_profil" src={picPath} alt="main picture" />
                    

                    {/*<img id="profile_profil" src={photo_profile} alt="main picture" />*/}

                    {!editpicture && (
                    <button id="edit_picture_profil" onClick={() => setEditPicture(!editpicture)}>Edit Picture</button>
                    )}

                    {editpicture && (
                        <div id="edit_picture_profil_div">
                            <img id="rat" src={path_picture("./rat.png")} alt="rat" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="boeuf" src={path_picture("./boeuf.png")} alt="boeuf" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="tigre" src={path_picture("./tigre.png")} alt="tigre" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="lapin" src={path_picture("./lapin.png")} alt="lapin" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="serpent" src={path_picture("./serpent.png")} alt="serpent" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="dragon" src={path_picture("./dragon.png")} alt="dragon" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="cheval" src={path_picture("./cheval.png")} alt="cheval" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="chevre" src={path_picture("./chevre.png")} alt="chevre" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="singe" src={path_picture("./singe.png")} alt="singe" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="coq" src={path_picture("./coq.png")} alt="coq" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="chien" src={path_picture("./chien.png")} alt="chien" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            <img id="cochon" src={path_picture("./cochon.png")} alt="cochon" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>

                            <img id="chat" src={path_picture("./chat.png")} alt="chat" style={{width:"100px", height:"100px"}} onClick={choose_picture}/>
                            
                        </div>
                        
                    )}
                    {editpicture && (
                        <div>
                        <button disabled={!picSeclected} onClick={save_picture} id="save_new_pic">Enregistrer</button>
                        <button onClick={cancel_edit_picture} id="cancel_new_pic">Annuler</button>
                        </div>
                    )}


                    <div id="profile1">
                        <p id="my_profile">Mon profil</p>
                        <p id="infos_profile_ff">{friendsList.length} Amis , {followersList.length} Abonnés </p>
                        
                    </div>
                   
                    <section id="section_profil">
                        <div id="messages_profil">
                            <PostsListProfil id={id} friendid={id} wordSearch={wordSearch}></PostsListProfil>
                        </div>
                    </section>
                </div>  
            </main>

        </body>

    )


}

export default Profil