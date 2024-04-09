import {useEffect, useState} from 'react';
import './Login.css'
import logo from './logo.png'

import axios from 'axios';

function Login(props){
    const [login,setLogin] = useState("");
    const [password,setPassword] = useState("");

    const [msg,setMsg] = useState("");

    const getLogin =(e) => { setLogin(e.target.value);setMsg(""); }
    const getPassword = (e) => { setPassword(e.target.value);setMsg(""); }


    function submitForm(e){//Login, Tenter de se connecter
        e.preventDefault();

            axios.post('http://localhost:4000/api/user/login', {login,password}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                })
                .then(res => {
                    if ( res.data.isLogged === true){
                        props.setID(res.data.userid);
                        props.login();
                        console.log(res.data)
                    }
                    else{
                        console.log("Utilisateur non connecté");
                    }
                })
                .catch(err => {
                    console.log(err);
                    setMsg(err.response.data.message);
                }
            )
    }


    return <div className="Login" id="login">
        <h1 id="co">Se connecter</h1>
        <form id="form_login" action="" method="POST" onSubmit={submitForm}>
            
            <label htmlFor="login" style={{fontSize:"18px"}}>Login : </label><input id="login" type="text" onChange={getLogin}></input>
            <label htmlFor="password" style={{fontSize:"18px"}}>Mot de passe : </label> <input type="password" id="password" onChange={getPassword}></input>
            <button id="login_connexion" type="submit" style={{fontSize:"16px"}}>Connexion</button> 
            <button id="login_cancel" type="reset" style={{fontSize:"16px"}}>Annuler</button>
            <div id="signup" style={{fontSize:"16px"}}>Pas inscrit ?</div>
            <button type="submit" id="connection_link" onClick={props.signin} style={{fontSize:"16px"}}>Sign up</button>
            <br></br>
            {msg!=="" ? <div id="msg_login" style={{fontSize:"18px"}}>{msg}</div > : <div style={{fontSize:"18px"}}>         </div>}
            <br></br>
            <br></br>
            <img id="logo_login" src={logo} alt="Une image" />
        </form>
        
        </div>


}

export default Login;