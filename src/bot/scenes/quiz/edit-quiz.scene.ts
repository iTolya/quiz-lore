import { Scenes } from 'telegraf';
import axios from 'axios';
import { Dictionary } from '../../interfaces/interface';

export const editQuizWizard = new Scenes.WizardScene<any>(
  'EDIT_QUIZ',
  async (ctx) => {
    ctx.reply('Enter quiz id');
    await ctx.wizard.next();
  },
  async (ctx) => {
    Object.assign(ctx.wizard.state, { edit: { quizId: ctx.message.text } });
    ctx.reply('Enter property to change');
    await ctx.wizard.next();
  },
  async (ctx) => {
    Object.assign(ctx.wizard.state.edit, { propertyName: ctx.message.text });
    ctx.reply('Enter new value');
    await ctx.wizard.next();
  },
  async (ctx) => {
    Object.assign(ctx.wizard.state.edit, { propertyValue: ctx.message.text });
    const changes = {} as Dictionary;
    changes[ctx.wizard.state.edit.propertyName] = ctx.wizard.state.edit.propertyValue;
    const headerList = JSON.parse(JSON.stringify(ctx.session.auth));
    const res = await axios.patch(
      `http://localhost:3300/quiz/${ctx.wizard.state.edit.quizId}`,
      { ...changes },
      {
        headers: {
          Cookie: `sAccessToken=${headerList.sAccessToken}; sIdRefreshToken=${headerList.sIdRefreshToken}`
        }
      }
    );
    const { data: quiz } = res.data;
    ctx.reply(`ID: ${quiz.id} \n\n` + `Название: ${quiz.displayName} \n\n` + `Описание: ${quiz.description} \n\n`);
    await ctx.scene.leave();
  }
);
