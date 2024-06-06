import User from "../models/user.model.js";
import bcryptjs from "bcryptjs"
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken'

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password || username === '' || email === '' || password === '') {
        // return res.status(400).json({ mesagge: 'All fields are Required' });
        next(errorHandler(400, 'All fields are Required'))
    }

    const hashedPassword = bcryptjs.hashSync(password, 10)

    try {
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        })

        await newUser.save();
        res.json('SignUp Successful');
    } catch (error) {
        next(error)
    }



};

//primera y BUENA
// export const signin = async (req, res, next) => {
//     const { email, password } = req.body
//     if (!email || !password || email === '' || password === '') {

//         next(errorHandler(400, 'All fields are Required'))

//     }

//     try {
//         const validUser = await User.findOne({ email })

//         if (!validUser) {
//             return next(errorHandler(404, 'User Not Found'))
//         }

//         const validPassword = bcryptjs.compareSync(password, validUser.password);
//         if (!validPassword) {
//             return next(errorHandler(404, 'Invalid Password'))
//         }

//         const token = jwt.sign(
//             {
//                 id: validUser._id, isAdmin: validUser.isAdmin
//             }, process.env.JWT_SECRET
//         );

//         //Creamos el token para que la password sea una cookie
//         const { password: pass, ...rest } = validUser._doc;

//         res.status(200).cookie('access_token', token, {
//             httpOnly: true
//         }).json(rest)



//     } catch (error) {
//         next(error)
//     }

// }

export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || email === '' || password === '') {
        return next(errorHandler(400, 'All fields are Required'));
    }

    try {
        const validUser = await User.findOne({ email });

        if (!validUser) {
            return next(errorHandler(404, 'User Not Found'));
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(404, 'Invalid Password'));
        }

        const token = jwt.sign(
            {
                id: validUser._id, isAdmin: validUser.isAdmin
            }, process.env.JWT_SECRET
        );

        // Incluimos la contraseña en la respuesta
        const { password: pass, ...rest } = validUser._doc;

        // Aquí estás enviando la respuesta JSON al cliente incluyendo la contraseña
        res.status(200).cookie('access_token', token, {
            httpOnly: true
        }).json({ ...rest, password: validUser.password }); // Incluimos la contraseña en la respuesta JSON

    } catch (error) {
        next(error);
    }
}




export const google = async (req, res, next) => {
    const { email, name, googlePhotoUrl } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET)
            const { password, ...rest } = user._doc;
            res.status(200).cookie('access_token', token, {
                httpOnly: true,
            }).json(rest);
        } else {
            const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatePassword, 10);
            const newUser = new User({
                username: name.toLowerCase().split(' ').join('') + Math.random().toString(36).slice(-8),
                email,
                password: hashedPassword,
                profilePicture: googlePhotoUrl,
            });

            await newUser.save();

            const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET);

            //Creamos el token para que la password sea una cookie
            const { password: pass, ...rest } = newUser._doc;

            res.status(200)
                .cookie('access_token', token, {
                    httpOnly: true
                }).json(rest)
        }
    } catch (error) {
        next(error)
    }
}


export const signout = (req, res, next) => {
    try {
        res
            .clearCookie('access_token')
            .status(200)
            .json('User has been signed out');
    } catch (error) {
        next(error);
    }
};

