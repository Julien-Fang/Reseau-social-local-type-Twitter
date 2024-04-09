import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./comment.css"


function Comment({comment,commentIDAuthor,refresh,setRefresh,page,refresh3,setRefresh3,refresh4,setRefresh4}){
    //comment , le commentaire
    //commentIDAuthor, l'id de l'auteur du commentaire, c'est a dire la personne connecté


    const [user,setUser] = useState({});
    const [like,setLike] = useState(0); //Nb de like
    const [likeState,setLikeState] = useState(false); //Si l'utilisateur a déjà liké ou non

    const [editComment,setEditComment] = useState(false);//Si l'utilisateur est en train d'éditer le commentaire
    const [new_comment,setNew_comment] = useState("");//Le nouveau commentaire

    const [deleteState,setDeleteState] = useState(false);//si l'utilisateur veut supprimer le commentaire

  /*  const [pinned,setPinned] = useState(false);
    const [refreshPinned,setRefreshPinned] = useState(false);*/

    useEffect(() => {//getUser, Trouver l'utilisateur qui a posté le commentaire
        axios.get(`http://localhost:4000/api/user/${comment.commentIDAuthor}`,{
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
    
    },[editComment]);





    useEffect(() => {//getInfoLike, Nb de like sur le commentaire
        axios.get(`http://localhost:4000/api/like/${comment.id}/infos`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                const user = res.data;
                setLike(user.count);
            })
            .catch(err => {
                console.log(err);
            })
    
    },[likeState]);



    useEffect(() => { //getLikedInfos, Si le post est liké ou non
        axios.get(`http://localhost:4000/api/like/user/${commentIDAuthor}/${comment.id}/liked`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setLikeState(res.data.liked);
            })
            .catch(err => {
                console.log(err);
            }
        )
    },[like,likeState]);




    const handleComment = (e) => { //like ou dislike le commentaire
        e.preventDefault();

        if(likeState){
            axios.delete(`http://localhost:4000/api/like/user/${commentIDAuthor}/${comment.id}`,{
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                }).then(res => {
                    setLikeState(res.data.liked);
                    setRefresh4(!refresh4);
                })
                .catch(err => {
                    console.log(err);
                }
            )

        }
        else{
            axios.post(`http://localhost:4000/api/like/user/${commentIDAuthor}/${comment.id}`,{
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                }).then(res => {
                    setLikeState(res.data.liked);
                    setRefresh4(!refresh4);
                })
                .catch(err => {
                    console.log(err);
                }
            )
        }
    }



    const handleEditComment = () => {
        setEditComment(!editComment);
    }

    const handleDeleteComment = () => {
        setDeleteState(!deleteState);
    }


    const submitEditComment = (e) => { //setComment2, Modifier le commentaire
        e.preventDefault();
        axios.put(`http://localhost:4000/api/comment/user/${commentIDAuthor}/comment2/${comment.id}`, {new_comment}, { //setComment2
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                })
                .then(res => {
                    setEditComment(false);
                    setRefresh(!refresh);
                })
                .catch(err => {
                    console.log(err);
                }
            )
    }


    

    const handleDeleteComment2 = (e) => { //deleteComment2, Supprimer le commentaire ainsi que ses likes
        e.preventDefault();
        axios.delete(`http://localhost:4000/api/comment2/user/${commentIDAuthor}/${comment.id}`,{ //deleteComment2
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setRefresh(!refresh);
                setDeleteState(!deleteState);
                setRefresh3(!refresh3);
            })
            .catch(err => {
                console.log(err);
            }
        )

    }    

/*

    const handlePinned = (e) => {
        e.preventDefault();
        if(pinned){
            axios.delete(`http://localhost:4000/api/pin2/user/${commentIDAuthor}/pin/${comment.id}`,{
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                }).then(res => {
                    console.log("pinned supprimé");
                    setPinned(res.data.pinned);
                    setRefreshPinned(!refreshPinned);
                })
                .catch(err => {
                    console.log(err);
                })

        }
        else{
            axios.post(`http://localhost:4000/api/pin2/user/${commentIDAuthor}/pin/${comment.id}`,{
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                }).then(res => {
                    console.log("pinned ajouté");
                    setPinned(res.data.pinned);
                    setRefreshPinned(!refreshPinned);
                })
                .catch(err => {
                    console.log(err.response.data.message);
                }
            )
        }
    }


    useEffect(() => { // si le post est épinglé ou non
        axios.get(`http://localhost:4000/api/pin/user/${commentIDAuthor}/pin/${comment.id}/pinned`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
               setPinned(res.data.pinned);
               console.log("pinned ?: "+res.data.pinned);
            })
            .catch(err => {
                console.log(err.response.data.message);
            }
        )
    },[refreshPinned]);
*/




    return(
        <li id="comment">
            <div id="comment_infos">{user.lastname} {user.firstname} {comment.commentDate}</div>
            <textarea id="comment_msg" value={comment.comment} readOnly />

            
            <button id="comment_coeur" type="button" style={likeState ? { color: "red" } : { color: "gray" }} onClick={handleComment}  >&#x2764;  {like}</button>
            {/*<button id="pin_post" type="button" style={ pinned ? { backgroundColor:"lightgreen"} : {backgroundColor :"lightgray"}} onClick={handlePinned} >&#x1F4CC;</button>*/}

            {comment.commentIDAuthor === commentIDAuthor ? <button id="comment_button_delete" type="button" onClick={handleDeleteComment} >Supprimer</button> : null  }
            {comment.commentIDAuthor === commentIDAuthor ? 
                    (editComment ?
                        (<form onSubmit={submitEditComment} id="form_comment_edit">                     
                            <textarea id="contenu_comment_edit1" onChange={(e) => setNew_comment(e.target.value)} />
                            <button id="comment_button_save" type="submit">Enregistrer</button>
                            <button id="comment_button_cancel" type="button" onClick={handleEditComment}>Annuler</button>
                        </form>
                        ):(
                            <button id="post_button_modify" type="button" onClick={handleEditComment}>Modifier</button>
                        )
                    ) : null
            }
            


            {deleteState ? 
                (<div style={{fontWeight:"bold", display:"display",marginLeft:"400px",marginTop:"15px"}}>Etes vous sur de vouloir supprimer ce commentaire?
                    <button id="delete_post_yes" type="button" onClick={handleDeleteComment2} >Oui</button>
                    <button id="delete_post_no" type="button" onClick={handleDeleteComment}>Non</button>
                </div>)
                : null
            }



        </li>

    );

}

export default Comment;
