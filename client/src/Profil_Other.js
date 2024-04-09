import { useState,useEffect } from 'react';
import axios from 'axios';

import logo from './logo.png'
import home_page from './home_page.png'
import personne from './personne.png'
import personnes from './personnes.png'
import pin from './pin.png'

import './Profil_Other.css';
import SearchBar from './SearchBar';
import PostsList from './PostsList';

import Friend from './Friend';
import Disconnect_button from './Disconnect_Button';
import PostsListProfil from './PostsListProfil';

const path_picture= require.context('./pictures',true);

function Profil_Other(props){
    //props comme le composant Profil avec une légère différence

    const [id,setId] = useState(props.id);
    const [friendsList, setFriendsList] = useState([]);
    const [followersList,setFollowersList] = useState([]);
    const [list,setList] = useState("friends");
    const [friendid,setFriendid] = useState(props.friendid);
    const [friendOrNot,setFriendOrNot] = useState(false);
    const [firstname, setFirstname] = useState(""); //nom de l'ami
    const [lastname, setLastname] = useState(""); //nom de l'ami
    const [login,setLogin] = useState("");//login de l'utilisateur (id)

    const[refresh,setRefresh] = useState(false);

    const [wordSearch, setWordSearch] = useState("");//Mot recherché

    const changeList = (e) => {setList(e);};


    useEffect(() => {//getUser, Trouver l'utilisateur qui a posté le message
        axios.get(`http://localhost:4000/api/user/${id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const user = res.data;
                setLogin(user.user.login);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[]);



    useEffect(() => {//getUser, Trouver l'utilisateur qui a posté le message
        axios.get(`http://localhost:4000/api/user/${friendid}`,{
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



    useEffect(() => { //getListFollowersID, Récupère la liste des followers de l'utilisateur friendid
        axios.get(`http://localhost:4000/api/friends/user/${friendid}/followersID`,{
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
    
    },[props.page,refresh]);




    useEffect(() => {//getListFriendsID //Récupère la liste des amis de l'utilisateur friendid
        axios.get(`http://localhost:4000/api/friends/user/${friendid}/friendsID`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const friends = res.data.friendsID;
                setFriendsList(friends);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[props.page,refresh]);


    const [commonFriendsList,setCommonFriendsList] = useState([]);

    useEffect(() => {//getFriendRelationship2, Récupère la liste des amis communs entre l'utilisateur et friendid
        axios.get(`http://localhost:4000/api/friends2/user2/${id}/friends/${friendid}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const commonfriends = res.data.commonFriends;
                setCommonFriendsList(commonfriends);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[props.page,refresh]);



    useEffect(() => {//getFriendOrNot, Vériie si l'utilisateur est ami avec friendid
        axios.get(`http://localhost:4000/api/friends/user/${id}/friendsOrNot/${friendid}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setFriendOrNot(res.data.friendsOrNot);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[props.page,list]);



    const deleteFriend = (e) => {
        e.preventDefault();
        //deleteFriend, Ne plus être ami avec friendid
        axios.delete(`http://localhost:4000/api/friends/user/${id}/friends/${friendid}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setRefresh(!refresh);
                setFriendOrNot(false);
            })
            .catch(err => {
                console.log(err);
            })
    }



    const addFriend = (e) => {
        e.preventDefault();
        //createFriend, Devenir ami avec friendid
        axios.post(`http://localhost:4000/api/friends/user/${friendid}/friends`,{login},{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setRefresh(!refresh);
                setFriendOrNot(true);
            })
            .catch(err => {
                console.log(err);
            })
    }
    


    const [picname,setPicName] = useState("");
    const [picPath,setPicPath] = useState("");



    useEffect(() => { //getPic, Récupère la photo de profil de l'utilisateur friendid
            axios.get(`http://localhost:4000/api/pic/${friendid}`,{
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






    return (
        <body id="body_profil_other">
            <header id="header_other">
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="logo_size_other" src={logo} alt="Main Logo" onClick={props.mur} /></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="home_page_other" src={home_page} alt="home page" onClick={props.mur}/></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="profil1_other" src={personne} alt="personne" onClick={props.profil}/></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="personne_other" src={personnes} alt="personne" onClick={props.getAllUsers}/></button>
                <button style={{  backgroundColor: "transparent", border:"none"}}><img id="pin_other" src={pin} alt="pin" onClick={props.getPin}/></button>

                <div id="profil_search_bar">
                    <SearchBar page="profil_page" setWordSearch={setWordSearch} ></SearchBar>
                </div>

                <div id="disconnect_other" >
                    <Disconnect_button logout={props.logout} idd={props.id}></Disconnect_button>
                </div>

            </header>
            <main id="main_profil_other"> 
                <aside id="friends_list_profil_other">
                    <button onClick={() => changeList("friends")} id="friends_button_other">Amis</button>
                    <button onClick={() => changeList("followers")} id="followers_button_other">Abonnés</button> 
                    <button onClick={() => changeList("common")} id="common_button_other">Relations</button>                   
                    
                    {list==="friends" && (
                        <div>
                            <p id="friends_list_title_other"> Amis </p>
                            <div>
                                <ul>
                                {friendsList.map((friend) => (
                                    <li><Friend id={friend}  page={props.page} ></Friend></li>
                                ))}
                                </ul>
                            </div>
                        </div>
                    ) }

                    {list==="followers" && (
                        <div>
                            <p id="followers_list_title_other"> Abonnés </p>
                            <div>
                                <ul>
                                {followersList.map((follower) => (
                                    <li><Friend id={follower}  page={props.page} ></Friend></li>
                                ))}
                                </ul>
                            </div>
                        </div>
                    ) }

                    {list==="common" && (
                        <div>
                            <p id="common_list_title_other"> Relations </p>
                            <div>
                                <ul>
                                {commonFriendsList.map((follower) => (
                                    <li><Friend id={follower}  page={props.page} ></Friend></li>
                                ))}
                                </ul>
                            </div>
                        </div>
                    ) }

                </aside>

                <div id="profile_picture_profil_other">

                    <img id="profile_profil_other" src={picPath} alt="main picture" />
                    {/*<img id="profile_profil" src={photo_profile} alt="main picture" />
*/}
                    <div id="profile1_other">
                        <div id="my_profile_other"> {lastname} {firstname} </div>
                        <p>{friendsList.length} Amis , {followersList.length} Abonnés </p>
                        <div>{!friendOrNot ? <button id="add_friend_button_other" onClick={addFriend}>Suivre</button> : <button id="remove_friend_button_other" onClick={deleteFriend}>Ne plus suivre</button>}   </div>
                    </div>
                   
                    <section id="section_profil_other">
                        <div id="messages_profil_other">
                            {/* <PostsListProfil id={friendid}></PostsListProfil> */}
                            <PostsListProfil id={id} friendid={friendid} wordSearch={wordSearch}></PostsListProfil>
                        </div>
                    </section>
                </div>  
            </main>


        </body>


    )


}

export default Profil_Other