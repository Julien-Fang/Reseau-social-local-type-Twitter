import {useState} from 'react';
import {MainPage} from './MainPage';
import Logout from './Logout';
import Login from './Login';
import MurMessage from './MurMessage';

function NavigationPanel({login,logout,isConnected,signin,profil,setID,id,getfriend,getAllUsers,getPin}){
    //login, fonction qui permet d'aller sur la page de connexion'
    //logout, fonction qui permet de se déconnecter
    //isConnected, est un booléen qui permet de savoir si l'utilisateur est connecté
    //signin, fonction qui permet d'aller sur la page d'inscription
    //profil, fonction qui permet d'aller sur le profil de l'utilisateur
    //setID, fonction qui permet de modifier l'id de l'utilisateur
    //id, est l'id de l'utilisateur connecté
    //getfriend, fonction qui permet d'aller sur le mur de l'ami
    //getAllUsers, fonction qui permet d'aller sur la page de tous les utilisateurs
    //getPin, fonction qui permet d'aller sur la page des messages épinglés


    return <div id="NavigationPanel">
           <nav>
            { (isConnected )? <MurMessage logout={logout} profil={profil} setID={setID} id={id} friend={getfriend} getAllUsers={getAllUsers} getPin={getPin}/> : <Login login={login} signin={signin} setID={setID} id={id} /> }
           </nav>
        </div>
}

export default NavigationPanel;