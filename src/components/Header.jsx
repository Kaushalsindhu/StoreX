import {useState, useEffect, useRef} from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { MdLogout, MdLogin } from 'react-icons/md';
import {account,ID,database,Query} from '../appwriteConfig.js';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { FaSlidersH } from "react-icons/fa";
import logo from '../assets/logo.jpg';
import SearchInput from './SearchInput.jsx';
import OtpDialog from './OtpDialog.jsx'

function Header(){
    // for signin dialog box
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [openOtp, setOpenOtp] = useState(false);
    const [otp, setOtp] = useState('')
    const [userId, setUserId] = useState('');
    const [isLoggedIn,setIsLoggedIn] = useState('false');
    const [success, setSuccess] = useState(false);
    const [error,setError] = useState(false);
    const navigate = useNavigate();

    const handleDropdownToggle = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleOpenSignIn = () => {
        setOpen(true);
        setDropdownOpen(false);
    };
    const handleCloseSignIn = () => {
        setOpen(false);
    };

    // for email
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const email = formJson.email;

        handleCloseSignIn();
        setOpenOtp(true);

        try {
            const sessionToken = await account.createEmailToken(ID.unique(), email);
            setUserId(sessionToken.userId);
        } catch (error) {
            toast.error('Failed to create token!')
            console.error('Failed to create token:', error);
        }
    };


    // for otp
    const handleOtpSubmit = async (otp) => {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;
        try {
            const session = await account.createSession(userId,otp);
            setIsLoggedIn(true);
            setSuccess(true);
            setError(false); 
            console.log("Session created:", session);

            const userAccount = await account.get();
            const existingUser = await database.listDocuments(databaseId, userCollectionId, [Query.equal('userId', userAccount.$id)]);
            if (existingUser.total === 0) {
            await database.createDocument(databaseId, userCollectionId, ID.unique(), {
                userId: userAccount.$id,
                email: userAccount.email,
                sharedFiles: [],
                starredFiles: [],
                deletedFiles: [],
                storage: 0
            });
            console.log('User created in users collection.');
            } else {
            console.log('User already exists in users collection.');
            }

            setTimeout(() => {
                setSuccess(false);         
                setOpenOtp(false);   
                navigate('/');         
            }, 3000);
        } catch (error) {
            setError(true);
            setTimeout(() => {
                setError(false);         
                setOpenOtp(false);      
            }, 3000);
            console.error("Session creation failed:", error.message);
        }
    };

    // handle signOut
    const handleLogout = async () => {
        await account.deleteSession('current');
        navigate('/not-logged-in');   
        setIsLoggedIn(false);
        setDropdownOpen(false);
    };

    useEffect(() => {
        account.get()
        .then(() => {setIsLoggedIn(true)})
        .catch(() => setIsLoggedIn(false));
    }, []);

  return (
    <div className="h-[65px] bg-[#F8FAFD] px-5 md:px-0 text-center flex justify-start items-center font-roboto-300 ">
        <div className="lg:w-64 w-45 h-full justify-start items-center hidden md:flex px-5">
            <img src={logo} alt="logo" className='w-[65px] h-[65px] rounded-full'/>
            <h1 className='text-xl font-normal text-gray-700'>StorX</h1>
        </div>

        <div className=" w-full md:w-[80%] h-full flex justify-between items-center">
            <div className="relative w-full md:w-4/5 lg:w-3/5 md:w ">
                <SearchInput/>
                <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
                </svg>
                <div className="absolute md:hidden right-2 top-6 transform -translate-y-1/2">
                    <button
                        onClick={handleDropdownToggle}
                        className="focus:outline-none text-gray-600"
                    >
                        <FaUserCircle className="text-3xl hover:text-gray-800 transition" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-10 mt-3 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-2">
                        {isLoggedIn ? (
                            <button
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-100"
                                onClick={handleLogout}
                            >
                                <MdLogout className="mr-2" />
                                Sign Out
                            </button>
                        ) : (
                            <button
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                                onClick={handleOpenSignIn}
                            >
                                <MdLogin className="mr-2" />
                                Sign In
                            </button>
                        )}
                        </div>
                    )}
                </div>
            </div>

            <div className='hidden md:flex justify-end items-center'>
                <button
                    onClick={handleDropdownToggle}
                    className="focus:outline-none text-gray-600"
                >
                    <FaUserCircle className="text-4xl hover:text-gray-800 transition" />
                </button>

               {dropdownOpen && (
                    <div className="absolute right-0 top-10 mt-3 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-2">
                    {isLoggedIn ? (
                        <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-100"
                            onClick={handleLogout}
                        >
                            <MdLogout className="mr-2" />
                            Sign Out
                        </button>
                    ) : (
                        <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                            onClick={handleOpenSignIn}
                        >
                            <MdLogin className="mr-2" />
                            Sign In
                        </button>
                    )}
                    </div>
                )}

                <Dialog open={open} onClose={handleCloseSignIn}>
                    <DialogTitle>Enter your email</DialogTitle>
                    <DialogContent sx={{ paddingBottom: 0 }}>
                    <DialogContentText>
                        To signin to this website, please enter your email address here. We
                        will send an OTP to the email you enter.
                    </DialogContentText>
                    <form onSubmit={handleSubmit}>
                        <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"

                        />
                        <DialogActions>
                        <Button onClick={handleCloseSignIn}>Cancel</Button>
                        <Button type="submit">Get OTP</Button>
                        </DialogActions>
                    </form>
                    </DialogContent>
                </Dialog>

                
                <OtpDialog
                    open={openOtp}
                    handleClose={() => setOpenOtp(false)}
                    handleSubmit={handleOtpSubmit}
                    success = {success}
                    error = {error}
                />
            </div>
        </div>
    </div>
  )
}

export default Header