import { response, request } from 'express';
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { createTransport } from 'nodemailer';
import { randomBytes } from 'crypto';
import { hash, genSalt } from 'bcryptjs';
import sgTransport from 'nodemailer-sendgrid-transport';
// Models
import { UserModel } from '../models/User';
import { RecoverModel } from './../models/Recover';
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

                const transporter = createTransport(sgTransport({
                    auth: {
                        api_key: process.env.ADMIN_EMAIL_API_KEY
                    }
                }));

                randomBytes(48, async (_, buffer) => {
                    const token = buffer.toString('hex');

                    const recover = await RecoverModel.create({
                        userId: user.id,
                        token: token,
                        used: 0
                    });

                    await recover.save();

                    transporter.sendMail({
                        from: `"Travel Guide 🗺️" <${ process.env.MAIL_USER }>`,
                        to: `${ email }`, // list of receivers
                        replyTo: process.env.MAIL_USER,
                        subject: "Recuperar contrasenya", // Subject line
                        html: `
                        <p>Hola ${ email }</p><br/>
                        <p>Has oblidat la teva contrasenya?</p>
                        <p>Hem rebut una petició per recuperar la contrasenya del teu compte.</p><br/>
                        <p>Per recuperar la contrasenya has de prémer el següent botó</p>
                        <a href="${ process.env.PSWD_RCVR_URL }?recoverToken=${ token }">Recuperar contrasenya</a>
                        `
                    }, (error, info) => {
                        if (error) {
                            LOGGER.error(`${ LOGGER_BASE } an error ocurred on sending mail to '${ email }' - Error: ${ error }`);
                            res.status(400).json({
                                message: `Ha sorgit un error al intentar enviar un correu de recuperació de contrasenya`
                            });
                        } else {
                            LOGGER.info(`${ LOGGER_BASE } Recover mail sent to ${ email }, ${ info }`);
                            res.status(200).json({
                                message: `S'ha enviat el mail de recuperació de contrasenya correctament`
                            });
                        }
                    });
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

export const newPassword = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `newPassword@AuthController -`;

    const { token } = req.query;
    const body = req.body;

    try {

        const recover: any = await RecoverModel.findOne({ 
            where: { 
                token: token,
                used: 0
            } 
        });

        if (recover == null || recover == undefined) {
            LOGGER.warn(`${ LOGGER_BASE } can't find a recover with token: ${ token }`);

            res.status(400).json({
                message: `S'ha produit un error al intentar canviar la contrasenya`
            });

            return;
        }

        const user: any = await UserModel.findOne({
            where: {
                id: recover.userId
            }
        });

        const salt = await genSalt(10);
        const hashedPassword = await hash(body.password, salt);

        if (user instanceof UserModel && user != null) {
            user.update(
                {
                    password: hashedPassword
                },
                {
                    where: {
                        id: recover.userId
                    }
                }
            );
            await user.save();
            
            recover.update(
                {
                    used: 1
                },
                {
                    where: {
                        id: recover.id
                    }
                }
            );
            await recover.save();

            res.status(200).json({
                message: `S'ha canviat la contrasenya per una nova correctament`
            });

            LOGGER.info(`${ LOGGER_BASE } user with id: '${ user.id }' changed the password succesfully`);
        } else {
            LOGGER.warn(`${ LOGGER_BASE } not found user with id: '${ recover.userId }'`);

            res.status(400).json({
                message: `S'ha produit un error al intentar canviar la contrasenya`
            });
        }

    } catch(error) {
        res.status(500).json({
            message: `Error al canviar la contrasenya`
        });

        LOGGER.error(`${ LOGGER_BASE } error changing the password for token: ${ token } - Error: ${ error }`);
    }
}