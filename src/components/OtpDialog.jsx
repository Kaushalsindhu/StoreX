import React, {useRef, useEffect} from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { green } from '@mui/material/colors';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';


function OtpDialog({open, handleClose, handleSubmit, success, error}){
    const inputRefs = useRef([]);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
            inputRefs.current[0]?.focus();
            }, 100); 
        }
    }, [open]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^\d$/.test(value)) {
        // Move to next input
        if (index < 5) inputRefs.current[index + 1].focus();
        } else if (value === '') {
        // Allow deletion
        } else {
        // Reject non-digit input
        e.target.value = '';
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value === '') {
            if (index > 0) {
            inputRefs.current[index - 1]?.focus();
            }
        }
    };

  const getOtp = () => {
    const otp = inputRefs.current.map(input => input.value).join('');
    handleSubmit(otp);
  };

    return(
        <Dialog open={open} onClose={handleClose}>
            {!success &&
                <DialogTitle>Enter OTP</DialogTitle>
            }
            <form onSubmit={(e) => {
                e.preventDefault();
                getOtp();
            }}>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2, fontSize: '1.2rem', textAlign: 'center'}}>
                {success? 'OTP verified! Welcome to StorX'
                : 'Please enter the 6-digit OTP sent to your email/phone:'}
                </Typography>
                
                {success ? (
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100px' }}>
                    <CheckCircleIcon sx={{ fontSize: 60, color: green[500], animation: 'pop 0.3s ease-out' }} />
                </Box>
                ) : (
                <Box display="flex" gap={1} justifyContent="center">
                    {[...Array(6)].map((_, index) => (
                    <TextField
                        key={index}
                        inputRef={el => (inputRefs.current[index] = el)}
                        inputProps={{
                        maxLength: 1,
                        style: { textAlign: 'center', fontSize: '1.5rem' }
                        }}
                        onChange={e => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                    ))}
                </Box>
                )}
                {error && (
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt:2 }}>
                        <ErrorOutlineIcon sx={{ color: 'error.main', mr: 1 }} />
                        <Typography variant="body2" color="error">
                        Invalid OTP. Please try again.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            {!success && !error && (
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" type='submit'>Submit</Button>
            </DialogActions>
            )}
            </form>
        </Dialog>
    )
}

export default OtpDialog;