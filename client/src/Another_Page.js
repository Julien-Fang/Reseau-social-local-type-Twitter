import { useEffect, useState } from 'react';
import './Another_Page.css';
import logo from './logo.png'
import home_page from './home_page.png'
import photo_profile from './photo_profile.jpg'
import personne from './personne.png'
import personnes from './personnes.png'
import pin from './pin.png'

import PostsList from './PostsList';

import SearchBar_Person from './SearchBar_Person';
import Disconnect_button from './Disconnect_Button';
import Friend from './Friend';
import SearchBar from './SearchBar';
import axios from 'axios';

const path_picture= require.context('./pictures',true);

function Another_Page (props){//{logout,id,page,friendid,profil,getFriend,mur}
    //props.logout, pour pouvoir se deconnecter
    //props.id, id de l'utilisateur connecté
    //props.page, page actuelle
    //props.friendid, permet de changer de page pour aller sur le mur d'un ami

    const [id,setId] = useState(props.id);
    const [friendsListID, setFriendsListID] = useState([]);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    
    const [allUsers, setAllUsers] = useState([]); //Tous les utilisateurs

    const [wordSearch, setWordSearch] = useState(""); //Mot recherché

    const [messagePinned,setMessagePinned] = useState([]); //Messages épinglés
    const [refresh, setRefresh] = useState(false);


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
                console.log("message List");
            })
    
    },[]);




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



    useEffect(() => { //getAllUsersID, Obtenir la liste ID de tous les utilisateurs sauf userid
        axios.get(`http://localhost:4000/api/user/${id}/allUsers`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const all = res.data.allUsers;
                setAllUsers(all);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[]);



    useEffect(() => { //getAllPinByUser, Obtenir la liste des messages épinglés d'un utilisateur userid
        axios.get(`http://localhost:4000/api/pin/user/${props.id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const pinned = res.data.messageList;
                setMessagePinned(pinned);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[refresh]);



    const [picname,setPicName] = useState("");
    const [picPath,setPicPath] = useState("");


    useEffect(() => {//getPic, Obtenir la photo de profil d'un utilisateur userid
        axios.get(`http://localhost:4000/api/pic/${id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                console.log("get pic");
                setPicName(res.data.picname );
                
                const  profil_pic = path_picture(`./${res.data.picname}.png`);
                
                setPicPath(profil_pic);
            })
            .catch(err => {
                console.log("error get pic");
                console.log(err);
            })
    },[]);






    return (
        <body>
            <header id="header_another">
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="logo_size_another" src={logo} alt="Main Logo" onClick={props.mur}/></button>   
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="home_page_another" src={home_page} alt="home page" onClick={props.mur}/></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="profil_another_page" src={personne} alt="profil" onClick={props.profil}/></button>
                {props.page === "all_users_page" ? (
                    <button style={{  backgroundColor: "transparent", border:"none"}}><img id="pin_another_page" src={pin} alt="pin" onClick={props.getPin}/></button>
                ):(
                    <button style={{  backgroundColor: "transparent", border:"none"}}><img id="allusers_another_page" src={personnes} alt="personne" onClick={props.getAllUsers}/></button>
                )
            }


                <div id="another_search_bar">
                    {props.page === "all_users_page" ? (
                        <SearchBar_Person id={id} setAllUsers={setAllUsers} setWordSearch={setWordSearch} />
                    ):null
                }
                </div>

                <div id="disconnect" >
                    {/*<button id="disconnect_button" type="submit" onClick={props.logout}>Deconnexion</button>*/}
                    {/*console.log("ID MUR: "+props.id)*/}
                    <Disconnect_button logout={props.logout} idd={props.id}></Disconnect_button>
                </div>

            </header>

            <main id="main_another"> 
                <aside >
                    <div id="profile_picture_another">
                        <img id="profile_pic_another" src={picPath} alt="main picture" />
                        
                        <div id="profile_another">
                            <div id="my_profile_another">{firstname} {lastname}</div>
                        
                        </div>

                        <div id="friends_list_another">
                            <p id="friends_list_title_another"> Amis </p>
                            <div>
                                <ul>
                                {friendsListID.map((friend) => (
                                    <li><Friend id={friend} getFriend={props.getfriend} ></Friend></li>
                                ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                </aside>         

                <section >
                    {<div id="another">
                        <ul>
                            {props.page === "all_users_page" ? (
                            <> <h2 style={{fontSize:"30px", borderBottom:"5px solid black"}}>Tous les utilisateurs</h2>

                                {(allUsers.length===0 || !allUsers )? (
                                    <p style={{fontSize:"20px"}}>Aucun autre utilisateur</p>) : (
                                allUsers.map((user) => (
                                <li style={{display:"flex",marginLeft:"50px"}}>
                                    <Friend id={user.id} getFriend={props.getfriend} page={props.page} />
                                </li>
                                ))
                        
                                )}
                            </>
                            ) : (
                            <>
                                <PostsList id={props.id} setMessagesList={setMessagePinned} messagesList={messagePinned} refresh={refresh} setRefresh={setRefresh} page={"mur_epingle"}/>
                            </>
                            )}
                        </ul>
                    </div>}
                </section>
            </main>
        </body>
    );









}

export default Another_Page;