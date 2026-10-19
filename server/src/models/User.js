import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit faire au moins 6 caractères'],
      select: false, // Par défaut, on ne renvoie pas le mot de passe dans les requêtes
    },
    role: {
      type: String,
      enum: ['client', 'agent', 'admin'],
      default: 'client',
    },
  },
  { timestamps: true }
);

// Middleware Mongoose : Hasher le mot de passe avant de sauvegarder
userSchema.pre('save', async function (next) {
  // Si le mot de passe n'a pas été modifié, on passe au suivant
  if (!this.isModified('password')) return next();

  // Hasher le mot de passe avec un "salt" de 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer le mot de passe entré avec celui hashé en base
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;