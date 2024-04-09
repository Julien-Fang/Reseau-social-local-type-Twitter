import { useState,useEffect } from "react";
import axios from "axios";
import Comment from "./Comment";
import './CommentsList.css'

function CommentsList({commentIDAuthor,messageid,userid,page,refresh3,setRefresh3,refresh4,setRefresh4}){
    //commentIDAuthor, l'id de l'auteur du commentaire, c'est a dire la personne connecté
    //messageid, l'id du message
    //userid, id du propriétaire du message
    //page, la page sur laquelle on se trouve

    const [comment,setComment] = useState("");
    const [commentsList,setCommentsList] = useState([]);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [commentid,setCommentid] = useState("");
    const [refresh,setRefresh] = useState(false);


    useEffect(() => {//Recup tous les commentaires
        axios.get(`http://localhost:4000/api/comments/comments`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const comments = res.data.comments;
                setCommentsList(comments);

            })
            .catch(err => {
                console.log(err);
            })
    
    },[commentid,refresh]);




    useEffect(() => {//Renvoie l'utilisateur
        axios.get(`http://localhost:4000/api/user/${commentIDAuthor}`,{
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



    const addComment = (e) => {//createComment, Ajoute un commentaire, userid est le propriétaire du message, messageid est l'id du message
        e.preventDefault();
        axios.post(`http://localhost:4000/api/comment/user/${userid}/message/${messageid}/${commentIDAuthor}`,{comment}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                })
                .then(res => {
                    setCommentsList([...commentsList, res.data.comment]);
                    setCommentid(res.data.comment.id);
                    setComment("");
                    setRefresh3(!refresh3);
                })
                .catch(err => {
                    console.log(err);
                }
                )
    }





    return (
        <div>
            <ul>
                {commentsList.map((comment) =>
                    messageid === comment.messageID ? (
                    <Comment comment={comment} commentIDAuthor={commentIDAuthor} refresh={refresh} setRefresh={setRefresh} page={page} refresh3={refresh3} setRefresh3={setRefresh3} refresh4={refresh4} setRefresh4={setRefresh4}/>
                    ) : null
                )}

            </ul>

            {page!=="profil" ?(
            <form onSubmit={addComment} id="form_commentslist">
                <label htmlFor="commentslist_firstname"></label>
                <input id="commentslist_firstname" type="text" value={firstname} readOnly />
                <label htmlFor="commentslist_lastname"></label>
                <input id="commentslist_lastname" type="text" value={lastname} readOnly />
                <br></br>
                <label htmlFor="commentslist_contenu"></label>
                
                <textarea id="commentslist_contenu" value={comment} onChange={(e) =>{ setComment(e.target.value)}} placeholder="Tapez votre commentaire"/>
                <button type="commentslist_button">Commenter</button>
            </form>
            ): null }

        </div>

    );



}

export default CommentsList;