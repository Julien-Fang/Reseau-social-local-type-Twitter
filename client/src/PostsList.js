import { useState,useEffect } from "react";
import axios from "axios";
import Post from "./Post";
import './PostsList.css';

function PostsList({id,number,setMessagesList,messagesList,refresh,setRefresh,page,refresh2,refresh3,setRefresh3,refresh4,setRefresh4,refresh5,setRefresh5}){
    //id, est l'id de l'utilisateur connecté
    //setMessagesList, est la fonction qui permet de modifier la liste des messages
    //messagesList, est la liste des messages
    //Tous les refresh, permettent de rafraichir une donnée, cela dépend du refresh
    const date = new Date();

    const [message, setMessage] = useState("");//message est le contenu du message
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [messageid,setMessageid] = useState("");

    const [msgError, setMsgError] = useState("");//msgError, si une erreur survient lors de la création d'un message

    useEffect(() => {//getUser, Renvoie l'utilisateur connecté
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





    const addPost = (e) => {//createMessage, Ajoute un message
        e.preventDefault();
        axios.post(`http://localhost:4000/api/messages/user/${id}/messages`,{message}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                })
                .then(res => {
                        
                    setMessagesList([...messagesList, res.data.message]);
                    setMessageid(res.data.message.id);
                    setRefresh(!refresh);
                    setMessage("");
                })
                .catch(err => {
                    console.log(err);
                    setMsgError(err.response.data.message);
                }
                )
    }


    return (
        <div id="posts_list">

            {page==="mur_epingle" ?(
                <h2 style={{fontSize:"30px", borderBottom:"5px solid black", width:"330px"}}>Mes messages épinglés</h2>):(<>

            <h2>Fils d'actualité</h2>
            
    
            <form onSubmit={addPost} id="form_postslist">
                <label htmlFor="firstname_postslist"></label>
                <input id="firstname_postslist" type="text" value={firstname} readOnly />
                <label htmlFor="lastname_postslist"></label>
                <input id="lastname_postslist" type="text" value={lastname} readOnly />
                <br></br>
                <label htmlFor="contenu_postslist"></label>
                <textarea id="contenu_postslist" value={message} onChange={(e) => {setMessage(e.target.value);setMsgError("")}} placeholder="Publier un message/post"/>
                <button id="postslist_button" type="submit">Publier</button>
                {msgError && <p>{msgError}</p>}
            </form>
            
            </>
            )}

            {page === "mur_epingle" && (!messagesList || messagesList.length === 0) ? (
            <p style={{fontSize:"20px"}}>Vous n'avez pas encore épinglé de message</p>
            ) : (
            <ul>
                {messagesList && messagesList.map((message) => (
                <Post message={message} commentIDAuthor={id} number={number} refresh={refresh} setRefresh={setRefresh} refresh2={refresh2}  refresh3={refresh3} setRefresh3={setRefresh3} refresh4={refresh4} setRefresh4={setRefresh4} refresh5={refresh5} setRefresh5={setRefresh5}/>
                ))}
            </ul>
            )}


        </div>
    );
    


}

export default PostsList;
