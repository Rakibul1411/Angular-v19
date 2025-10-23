import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail.js';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: v => isEmail(v),
      message: props => `${props.value} is not a valid email!`
    },
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    lowercase: true,
    trim: true,
    required: true,
    default: 'student',
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
},
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);
export default User;