import { response, request } from 'express';
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
// Models
import { UserModel } from '../models/User';
// Helpers
import { LOGGER } from '../helpers/Logger';

const googleClient = new OAuth2Client({
    clientId: process.env.OAUTH2_CLIENT_ID,
});

export const loginUserGoogle = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `loginUserGoogle@AuthController -`;

    const { token } = req.body;

    const ticket: LoginTicket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.OAUTH2_CLIENT_ID,
    });

    const payload: TokenPayload = ticket.getPayload();

    try {
        let user: any = await UserModel.findOne({ where: { email: payload?.email } });

        if (!user) {
            user = await UserModel.create({
                userName: payload?.name,
                email: payload?.email,
            });
    
            await user.save();
        }
    
        res.json({ user, token });

        LOGGER.info(`${ LOGGER_BASE } user with email: '${ payload?.email }' logged with google succesfully`);
    } catch (error) {
        res.status(401).json({
            message: `Ha sorgit un intentar fer login ambel compte de google`
        });

        LOGGER.error(`${ LOGGER_BASE } error logging with google with email: '${ payload?.email }' - Error: ${ error }`);
    }
}

export const recoverPassword = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `recoverPassword@AuthController -`;
    
    const { email } = req.query;

    try {
        if (email != null && email != undefined) {
            let user: any = await UserModel.findOne({ where: { email: email } });

            if (user != null && user != undefined) {

                const transporter = createTransport({
                    host: process.env.MAIL_HOST,
                    port: Number(process.env.MAIL_PORT),
                    auth: {
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_PASSWORD
                    }
                });
            
                await transporter.sendMail({
                    from: '"Travel Guide 🗺️" <recover@travelguide.com>', // sender address
                    to: `${ email }`, // list of receivers
                    subject: "Recuperar contrasenya", // Subject line
                    text: `Test Mail`, // plain text body
                    html: "<b>Hello world?</b>" // html body
                });

                LOGGER.info(`${ LOGGER_BASE } Recover mail sent to ${ email }`);

                res.status(200).json({
                    message: `S'ha enviat el mail de recuperació de contrasenya correctament`
                });
            }

        }
        
    } catch (error) {
        res.status(401).json({
            message: `Ha sorgit un error al recordar la contrasenya`
        });

        LOGGER.error(`${ LOGGER_BASE } error trying to remember password for user with email: '${ email }' - Error: ${ error }`);
    }
}