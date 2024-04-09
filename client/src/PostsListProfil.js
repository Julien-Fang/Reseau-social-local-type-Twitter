import { useState,useEffect } from "react";
import axios from "axios";
import Post from "./Post";

function PostsListProfil(props){
    //props.id, id de l'utilisateur connecté
    //props.friendid, id de l'ami

    const [userid,setUserid]=useState(props.friendid);
    const date = new Date();

    const [message, setMessage] = useState("");
    const [messagesList, setMessagesList] = useState([]);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [messageid,setMessageid] = useState("");
    

    useEffect(() => {
        if(props.wordSearch === ""){
        axios.get(`http://localhost:4000/api/messages/messages`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const messages = res.data.messages;
                setMessagesList(messages);

            })
            .catch(err => {
                console.log(err);
            })
        }
        else{
            axios.get('http://localhost:4000/api/messages/word', { //getMessageByWord, permet de récupérer les messages contenant le mot word
                params: { word: props.wordSearch },
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
            })
            .then(res => {
                const messages = res.data.messages;
                setMessagesList(messages);
            }
        )
        .catch(err => {
            console.log(err);
        }
        )
        }
    },[props.wordSearch]);




    useEffect(() => {
        axios.get(`http://localhost:4000/api/user/${props.friendid}`,{
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

    return (
        <div id="posts_list">
            <h2>Mes messages</h2>
            <ul>
                {messagesList.map((message) => (
                    message.userid=== userid ?
                    <Post message={message} page={"profil"} commentIDAuthor={props.id} />
                    : null
                ))}
            </ul>
        </div>
    );
    


}

export default PostsListProfil;
