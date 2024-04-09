import axios from 'axios';
import logout from './logout.png';

function Disconnect_button(props){
    //props.logout, pouvoir se déconnecter
    //props.idd, id de l'utilisateur connecté

    const handleLogout = (e) => {
        e.preventDefault();
        axios.delete(`http://localhost:4000/api/user/${props.idd}/logout`, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
            })
            .then(res => {
                props.logout();
                console.log("Déconnecté");
            }
            )
            .catch(err => {
                console.log(err);
            }
            )
    }

    return (
        <button id="disconnect_button" type="submit" onClick={handleLogout}>
            <img id="logout_logo" src={logout} alt="logout"/>
        </button>
 
    )

}

export default Disconnect_button