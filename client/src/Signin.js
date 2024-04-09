import {useEffect, useState} from 'react';
//import {MainPage} from './MainPage';
import './Signin.css';
import logo from './logo.png'
import axios from 'axios';

function Signin(props){

    const [firstname,setFirstName] = useState("");
    const [lastname,setLastName] = useState("");
    const [login,setLogin] = useState("");
    const [password,setPassword] = useState("");
    const [confirmpassword,setPassword2] = useState("");
    const [passwordOK,setPasswordOK] = useState(true);
    const [message,setMessage] = useState("");

    const getFirstName = (e) => { setFirstName(e.target.value);setMessage("") }
    const getLastName = (e) => { setLastName(e.target.value);setMessage("") }
    const getLogin = (e) => { setLogin(e.target.value);setMessage("") }
    const getPassword = (e) => { setPassword(e.target.value) }
    const getPassword2 = (e) => { setPassword2(e.target.value) }

    useEffect(() => {setPasswordOK(password===confirmpassword)},[password,confirmpassword]);

    const submit2 = (e) => { 
        e.preventDefault();

        axios.post('http://localhost:4000/api/user', {login,password,confirmpassword,lastname,firstname}, { //Signin, Création d'un utilisateur
        headers: {
          'Content-Type': 'application/json'},
      })
      .then(res => { 
        console.log(res);
        console.log(res.data.message);
        props.logout();
      })
      .catch(err => { 
        setMessage(err.response.data.message)
      })

    };
    

    const resetPasswordOK = () => {setPasswordOK(true);setMessage("")}

    return <div className="Signin">
        <h1 id="title_signin">S'inscrire</h1>
        <form id="form_signin" onSubmit={submit2}>
            <label htmlFor="firstname" style={{fontSize:"18px"}}>First Name</label> <input id="firstname" onChange={getFirstName} placeholder="Prénom"/>
              <label htmlFor="lastname" style={{fontSize:"18px"}}>Last Name</label> <input id="lastname" onChange={getLastName} placeholder='Nom'/>
              <label htmlFor="login" style={{fontSize:"18px"}}>Login</label><input id="login" onChange={getLogin}/>
            <label htmlFor="password" style={{fontSize:"18px"}}>Password</label> <input id="password" type="password" onChange={getPassword}/>
            <label htmlFor="password2" style={{fontSize:"18px"}} id="signin_reconfirm">Password confirmation</label> <input id="signin_password2" type="password" onChange={getPassword2}/>
            <div>
              <button id="signin_s" type="submit" disabled={!passwordOK} style={{fontSize:"16px"}}>Sign In</button>
              <button id="signin_reset" type="reset" onClick={resetPasswordOK} style={{fontSize:"16px"}}>Reset</button>
            </div>

            <button id="login_page_signin" onClick={props.login} style={{fontSize:"16px"}}>Login</button>
            <br></br>
            { passwordOK ? <p></p> : <p id="error_password"style={{color:"red",fontSize:"18px"}}>Mot de passe différents</p> }
            <p id="message_signin" style={{fontSize:"18px"}}>{message}</p>
            <img id="logo_" src={logo} alt="Une image" />
        </form>
    </div>

}

export default Signin;