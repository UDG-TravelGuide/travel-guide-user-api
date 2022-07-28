import { response, request } from 'express';
import { LoginTicket, OAuth2Client, TokenPayload } from "google-auth-library";
import { UserModel } from '../models/User';

const OAUTH2_CLIENT_ID = '127003238290-ff8i4lec6t6fvvv9bmbpq02fq3tuls7f.apps.googleusercontent.com';

const googleClient = new OAuth2Client({
    clientId: OAUTH2_CLIENT_ID,
});

export const loginUserGoogle = async ( req = request, res = response ): Promise<void> => {
    const { token } = req.body;

    const ticket: LoginTicket = await googleClient.verifyIdToken({
        idToken: token,
        audience: OAUTH2_CLIENT_ID,
    });

    const payload: TokenPayload = ticket.getPayload();

    let user: any = await UserModel.findOne({ where: { email: payload?.email } });

    if (!user) {
        user = await UserModel.create({
            userName: payload?.name,
            email: payload?.email,
        });

        await user.save();
    }

    res.json({ user, token });
}