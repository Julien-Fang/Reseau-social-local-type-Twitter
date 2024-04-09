import { useEffect,useState } from "react";
import axios from "axios";
import CommentsList from "./CommentsList";
import "./post.css"

function Post({message,commentIDAuthor,page,number,refresh,setRefresh,refresh2,refresh3,setRefresh3,refresh4,setRefresh4,refresh5,setRefresh5}){
    //Tous les props refresh permettent d'actualiser
    //message, represente le post
    //commentIDAuthor, l'id de l'utilisateur qui a posté le message

    const [user,setUser] = useState({}); //l'utilisateur du post
    const [like,setLike] = useState(0); //Nb de like
    const [hideComments,setHideComments] = useState(true); //Cacher les commentaires
    const [likeState,setLikeState] = useState(false); //Si l'utilisateur a déjà liké ou non

    const [edit,setEdit] = useState(false); //Si l'utilisateur veut modifier le post
    const [new_message,setNew_message] = useState(""); //Le nouveau message pouru ne modification

    const [deleteState,setDeleteState] = useState(false);//Si l'utilisateur veut supprimer le post

    const [pinned,setPinned] = useState(false);//Si le post est épinglé
    const [refreshPinned,setRefreshPinned] = useState(false);//Actualiser l'état de l'épinglage


    useEffect(() => {//getUser, Trouver l'utilisateur qui a posté le message
        axios.get(`http://localhost:4000/api/user/${message.userid}`,{
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
    
    },[message.id,edit]);



    useEffect(() => { //getInfoLike, le nombre de like sur le post
        axios.get(`http://localhost:4000/api/like/${message.id}/infos`,{
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
    
    },[likeState,edit]);


    

    useEffect(() => { //getLikedInfos, Si le post est liké ou non
        axios.get(`http://localhost:4000/api/like/user/${commentIDAuthor}/${message.id}/liked`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setLikeState(res.data.liked);
               // console.log("like? : "+res.data.liked);
            })
            .catch(err => {
                console.log(err);
            }
        )
    },[edit,likeState, refresh2]);



    useEffect(() => {
        setHideComments(true);
        setEdit(false);
        setDeleteState(false);
     }
    ,[refresh2]);


    const handleHideComments = () => {
        setHideComments(!hideComments);
    }

    const handleDeletePost = () => {
        setDeleteState(!deleteState);}


    const handleLike = (e) => {
        e.preventDefault();

        if(likeState){ //deleteLike, Mettre a jour le like, supprimer un like
            axios.delete(`http://localhost:4000/api/like/user/${commentIDAuthor}/${message.id}`,{
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                }).then(res => {
                    console.log("like supprimé :");
                    setLikeState(res.data.liked);
                    setRefresh4(!refresh4);
                })
                .catch(err => {
                    console.log(err);
                }
            )

    }
    else{ //createLike, Mettre a jour le like, ajouter un like
        axios.post(`http://localhost:4000/api/like/user/${commentIDAuthor}/${message.id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                console.log("like ajouté :");
                setLikeState(res.data.liked);
                setRefresh4(!refresh4);
            })
            .catch(err => {
                console.log(err);
            }
        )
    }
    }


    const handleEdit =() => {
        setEdit(true);
    }


    const submitEdit = (e) => { //setMessage2, Modifier le message
        e.preventDefault();
        axios.put(`http://localhost:4000/api/messages/user/${commentIDAuthor}/messages2/${message.id}`, {new_message}, {
            headers: {
               'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            })
            .then(res => {
                setEdit(false);
                setRefresh(!refresh);
            })
            .catch(err => {
                console.log(err);
            }
            )
    }


    const handleDeletePost2 = (e) => {
        e.preventDefault();
        //deleteMessage2, supprimer un message(également les commentaires,likes,pins)
        axios.delete(`http://localhost:4000/api/messages2/user2/${commentIDAuthor}/messages2/${message.id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
                setRefresh(!refresh);
                setDeleteState(!deleteState);
                setRefresh3(!refresh3);
                setRefresh4(!refresh4);
                setRefresh5(!refresh5);
            })
            .catch(err => {
                console.log(err);
            }
        )
    }



    const handlePinned = (e) => {
        e.preventDefault();
        if(pinned){ //deletePin, Mettre a jour le pinned, desépingler
            axios.delete(`http://localhost:4000/api/pin2/user/${commentIDAuthor}/pin/${message.id}`,{
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                }).then(res => {
                    console.log("pinned supprimé");
                    setPinned(res.data.pinned);
                    setRefreshPinned(!refreshPinned);
                    setRefresh5(!refresh5);
                })
                .catch(err => {
                    console.log(err);
                })

        }
        else{ //createPin2, Mettre a jour le pinned, épingler
            axios.post(`http://localhost:4000/api/pin2/user/${commentIDAuthor}/pin/${message.id}`,{
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
                }).then(res => {
                    console.log("pinned ajouté");
                    setPinned(res.data.pinned);
                    setRefreshPinned(!refreshPinned);
                    setRefresh5(!refresh5);
                })
                .catch(err => {
                    console.log(err.response.data.message);
                }
            )
        }
    }



    useEffect(() => { //getPinnedInfos, Si le post est épinglé ou non
        axios.get(`http://localhost:4000/api/pin/user/${commentIDAuthor}/pin/${message.id}/pinned`,{
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            }).then(res => {
               setPinned(res.data.pinned);
               //console.log("pinned ?: "+res.data.pinned);
            })
            .catch(err => {
                console.log(err.response.data.message);
            }
        )
    },[refreshPinned, refresh2]);






    return (
        <li>
            <p id="post">
                <div id="post_infos">{user.firstname} {user.lastname}, le {message.messageDate}</div> 
                <textarea id="post_msg" value={message.message} readOnly/>
                
                <button id="post_coeur" type="button" style={likeState ? { color: "red" } : { color: "gray" }} onClick={handleLike} >&#x2764;  {like}</button>
                <button id="pin_post" type="button" style={ pinned ? { backgroundColor:"lightgreen"} : {backgroundColor :"lightgray"}}  onClick={handlePinned} >&#x1F4CC;</button>
                
                
                <button id="hide_comments" type="button"  onClick={handleHideComments}>Commentaire(s)</button>
                
                
                {message.userid === commentIDAuthor ? <button id="post_button_delete" type="button" onClick={handleDeletePost} >Supprimer</button> : null }
                {message.userid === commentIDAuthor ? 
                    (edit ?
                        (<form onSubmit={submitEdit} id="form_posts_edit">                     
                            <textarea id="contenu_post_edit" onChange={(e) => setNew_message(e.target.value)} />
                            <button id="post_button_save" type="submit">Enregistrer</button>
                            <button id="post_button_cancel" type="button" onClick={() => setEdit(false)}>Annuler</button>
                        </form>
                        ):(
                            <button id="post_button_edit" type="button" onClick={handleEdit}>Modifier</button>
                        )
                    ) : null
                }

         
            {deleteState ? 
            (<div id="confirm_delete_post">/!\ Êtes-vous sûr de vouloir supprimer ? 
                <button id="delete_post_yes" type="button" onClick={handleDeletePost2} >Oui</button>
                <button id="delete_post_no" type="button" onClick={handleDeletePost}>Non</button>
            </div>) : null}

            </p>
            


            {!hideComments ? (
           <CommentsList commentIDAuthor={commentIDAuthor} messageid={message.id} userid={message.userid} page={page}  refresh3={refresh3} setRefresh3={setRefresh3} refresh4={refresh4} setRefresh4={setRefresh4}></CommentsList>)
            : null}
        
            

        </li>

    );

    
}
    
export default Post;