import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Friend.css';

function Friend({id,getFriend,page}){
    //id, l'id de l'utilisateur ami
    //getFriend, fonction qui permet d'aller sur le mur de l'ami
    //page, page actuelle

    const [user,setUser] = useState({});


    useEffect(() => { //getUser, Trouver l'uutilisateur ami avec son id
        axios.get(`http://localhost:4000/api/user/${id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const user = res.data;
                setUser(user.user);

            })
            .catch(err => {
                console.log(err);

            })
    
    },[id]);




    return (

         <div>      
            {page==="friend_page" ? (
                <div id="friends_list_friends"> {user.lastname} {user.firstname}</div>):
                (
            <button id="friends_list" onClick={()=>getFriend(id) }> {user.lastname} {user.firstname}</button>)}
        
        </div>
    );
}

export default Friend;