import { Markup, Scenes } from 'telegraf';
import axios from 'axios';
import appConfig from '../../../app.config';

export const signoutWizard = new Scenes.WizardScene<any>('SIGNOUT', async (ctx) => {
  ctx.deleteMessage(ctx.session.last_bot_message_id);
  let headerList, res;
  try {
    headerList = JSON.parse(JSON.stringify(ctx.session.auth));
  } catch {
    ctx.reply(
      'Чтобы выйти 🚪, нужно сначала войти 🚪 :)',
      Markup.inlineKeyboard([Markup.button.callback('Войти 🚪', 'signinup')], { columns: 2 })
    );
    await ctx.scene.leave();
  }
  try {
    res = await axios.post(
      `${appConfig().host}/auth/signout`,
      {},
      {
        headers: {
          Cookie: `sIdRefreshToken=${headerList.sIdRefreshToken}; sRefreshToken=${headerList.sAccessToken}`
        }
      }
    );
    const data = res.data;
    if (data.status === 'OK') {
      Object.assign(ctx.session, { auth: undefined });
      const { message_id: msgid } = await ctx.reply(
        'Вы успешно вышли, нажмите Далее чтобы продолжить, до новых встреч',
        Markup.inlineKeyboard([Markup.button.callback('Далее', 'start_work')])
      );
      ctx.session.last_bot_message_id = msgid;
    } else {
      ctx.reply(`Что-то пошло не так, ошибка ${data.status}`);
      await ctx.scene.leave();
    }
  } catch (error: any) {
    ctx.reply(`Что-то пошло не так, ошибка ${error.data ? error.data.message : error.message}`);
  }
  await ctx.scene.leave();
});
