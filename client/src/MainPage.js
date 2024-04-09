import {useState, useEffect} from 'react';
import NavigationPanel from './NavigationPanel';
import Signin from './Signin';
import Profil from './Profil';
import axios from 'axios';
import Profil_Other from './Profil_Other';
import Another_Page from './Another_Page';


function MainPage(props){
    const [page,setPage] = useState("login_page");
    const [isConnected,setConnect] = useState(false);
    const [id,setId] = useState("");
    const [friendId,setFriendId] = useState("");
    

    useEffect(() => { 
        axios.get('http://localhost:4000/api/user/relog', {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            })
            .then(res => {
                if(res.data.user.isLogged === true){
                    setId(res.data.user.id);
                    setConnect(true);
                    setPage("message_page");
                }
                else{
                    console.log("logged ? : "+res.data.user.isLogged);
                }
            })
            .catch(err => {
                console.log(err);
            }
            )
    },[]); 




    const getConnected = () =>{
        setConnect(true);
        setPage("message_page");
    }

    const setLogout = () => {
        setConnect(false);
        setPage("login_page");
    }

    const setLogin =() => {
        setPage("login_page");
    }

    const getSignin =() =>{
        setPage("signin_page");
    }

    const getProfil =() =>{
        setPage("profil_page");
    }

    const setID = (id) =>{
        setId(id);
    }

    const getFriend = (id) =>{
        setPage("friend_page");
        setFriendId(id);
    }

    const getAllUsers = ()=>{
        setPage("all_users_page");
    }

    const getPin = ()=>{
        setPage("pin_page");
    }
    

    return <div className="MainPage">
                { page ==="profil_page" ? <Profil logout={setLogout} id={id} mur={getConnected} page={page} getFriend={getFriend} getAllUsers={getAllUsers} getPin={getPin}/> :
                ( page ==="friend_page" ? <Profil_Other logout={setLogout} id={id} mur={getConnected} page={page} friendid={friendId}    profil={getProfil} getAllUsers={getAllUsers} getPin={getPin}/> :
                ( (page ==="all_users_page" || page==="pin_page") ? <Another_Page profil={getProfil} logout={setLogout} id={id} page={page} friendid={friendId} getfriend={getFriend} mur={getConnected} getAllUsers={getAllUsers} getPin={getPin} /> :
                ( page ==="signin_page" ? <Signin login={setLogin} logout={setLogout}/> : <NavigationPanel login={getConnected} logout={setLogout} isConnected={isConnected} signin={getSignin}  profil={getProfil} setID={setID} id={id} getfriend={getFriend} getAllUsers={getAllUsers} getPin={getPin}/>))) }


            </div>;
}

export default MainPage;
