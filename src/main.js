const {HtmlTelegramBot, userInfoToString} = require("./bot");
const ChatGptService = require("./gpt");

class MyTelegramBot extends HtmlTelegramBot {
    constructor(token) {
        super(token);
        this.mode = null;
        this.list = [];
        this.user = {};
        this.counter = 0;
    }

    async start(message) {
        this.mode = "main";
        const text = this.loadMessage('main');
        await this.sendImage('main');
        await this.sendText(text);

        //add menu
        await this.showMainMenu({
            'start': '-главное меню бота',
            'profile': '-генерация Tinder-профиля 😎',
            'opener': '-сообщение для знакомства 🥰',
            'message': '-переписка от вашего имени 😈',
            'date': '-переписка со звездами 🔥',
            'gpt': '-задать вопрос чату GPT 🧠',
            'html': '-Демонстрация html',
        })


    }

    async hello(message) {
        if (this.mode === 'gpt') {
            await this.gptDialog(message);
        } else if (this.mode === 'date') {
            await this.dateDialog(message);
        } else if (this.mode === 'message') {
            await this.messageDialog(message);
        } else if (this.mode === 'profile') {
            await this.profileDialog(message);
        } else if (this.mode === 'opener') {
            await this.openerDialog(message);
        }
        else {
            const text = message.text;
            await this.sendText('<b>Привед</b>');
            await this.sendText('<i>Как оно?</i>');
            await this.sendText(`Ты написал: ${text}`);

            await this.sendImage("avatar_main");

            await this.sendTextButtons("Какая у Вас тема в Телеграмм?", {
                'theme_light': 'Светлая',
                'theme_dark': 'Темная'
            });
        }

    }

    async helloButton(callbackQuery) {
        const query = callbackQuery.data;
        if (query === 'theme_light') {
            await this.sendText("Click on 'theme_light' button");
        } else if (query === 'theme_dark') {
            await this.sendText("Click on 'theme_dark' button");
        }
    }

    async html(message) {
        await this.sendHTML('<h3 STYLE="color: #1558b0">ПРИВЕТ!</h3>');
        const html = this.loadHtml("main");
        await this.sendHTML(html, {
            theme: 'dark'
        });
    }

    async gpt(message) {
        this.mode = "gpt";
        const text = this.loadMessage('gpt');
        await this.sendImage('gpt');
        await this.sendText(text);
    }

    async gptDialog(message) {
        const text = message.text;
        const myMessage = await this.sendText('Ждите ответа, сообщение обрабатывается...')
        const answer = await chatGpt.sendQuestion("ответь на вопрос", text);
        await this.editText(myMessage, answer);
    }


    async date(message) {
        this.mode = "date"
        const text = this.loadMessage('date');
        await this.sendImage('date');
        await this.sendTextButtons(text, {
            'date_grande': 'Ариана Гранде',
            'date_robbie': 'Марго Робби',
            'date_zendaya': 'Зендея',
            'date_gosling': 'Райан Гослинг',
            'date_hardy': 'Том Харди',
        });
    }

    async dateButton(callbackQuery) {
        const query = callbackQuery.data;
        await this.sendImage(query);
        await this.sendText('Отличный выбор! Пригласи девушку или парня нв свидание за 5 сообщений!)');

        const prompt = this.loadPrompt(query);
        await chatGpt.setPrompt(prompt);
    }

    async dateDialog(message) {
        const text = message.text;
        const myMessage = await this.sendText('Собеседник набирает текст...');
        const answer = await chatGpt.addMessage(text);
        // await this.sendText(answer);
        await this.editText(myMessage, answer)
    }

    async message(message) {
        this.mode = 'message';
        const text = this.loadMessage('message');
        await this.sendImage('message');
        await this.sendText(text);
        await this.sendTextButtons(text, {
            'message_next': 'Сдедующее сообщение',
            'message_date': 'Пригласить на свидание'
        });
        this.list = []
    }

    async messageButton(callbackQuery) {
        const query = callbackQuery.data;
        const prompt = this.loadPrompt(query);
        const userChatHistory = this.list.join('\n\n');

        const myMessage = await this.sendText('ChatGPT думает...');
        const answer = await chatGpt.sendQuestion(prompt, userChatHistory);
        await this.editText(myMessage, answer);
    }

    async messageDialog(message) {
        const text = message.text;
        this.list.push(text);
    }

    async profile(message) {
        this.mode = 'profile';
        const text =this.loadMessage('profile');
        await this.sendImage('profile');
        await this.sendText(text);

        this.user = {};


        await this.sendText('Сколько лет?');
    }

    async profileDialog(message) {
        const text = message.text;
        this.counter++;

        if(this.counter === 1){
            this.user['age'] = text;
            await this.sendText('Кем работаешь?');
        }
        if(this.counter === 2){
            this.user['occupation'] = text;
            await this.sendText('Какое у тебя хобби?');
        }
        if(this.counter === 3){
            this.user['hobby'] = text;
            await this.sendText('Чем тебя бесят люди?');
        }
        if(this.counter === 4){
            this.user['annoys'] = text;
            await this.sendText('Цель знакомства?');
        }
        if(this.counter === 5){
            this.user['goals'] = text;

            const prompt = this.loadPrompt('profile');
            const info = userInfoToString(this.user);

            const myMessage = await this.sendText('ChatGPT думает...');
            const answer = await chatGpt.sendQuestion(prompt, info);
            await this.editText(myMessage, answer);
        }
    }

    async opener(message){
        this.mode = 'opener';

        const text =this.loadMessage('opener');
        await this.sendImage('opener');
        await this.sendText(text);

        this.user = {};
        this.counter = 0;
        await this.sendText('Имя партнера?');

    }

    async openerDialog(message){
        const text = message.text;
        this.counter++;

        if(this.counter === 1){
            this.user['name'] = text;
            await this.sendText('Сколько лет партнеру?');
        }
        if(this.counter === 2){
            this.user['age'] = text;
            await this.sendText('Внешность партнера: 1-10?');
        }
        if(this.counter === 3){
            this.user['handsome'] = text;
            await this.sendText('Кем работает партнер?');
        }
        if(this.counter === 4){
            this.user['occupation'] = text;
            await this.sendText('Цель знакомства?');
        }
        if(this.counter === 5){
            this.user['goals'] = text;

            const prompt = this.loadPrompt('opener');
            const info = userInfoToString(this.user);

            const myMessage = await this.sendText('ChatGPT генерирует твой опенер...');
            const answer = await chatGpt.sendQuestion(prompt, info);
            await this.editText(myMessage, answer);
        }

    }
}

const chatGpt = new ChatGptService("gpt:h4CQINi3RUNETJprJI4HJFkblB3TYAWTNapKtwbtLBVoSgEz")
const bot = new MyTelegramBot("7323942173:AAHwfPheYy50Xp5FG1ZYZN62N0MQPWezLuo");
bot.onCommand(/\/start/, bot.start); // /start
bot.onCommand(/\/html/, bot.html); // /html
bot.onCommand(/\/gpt/, bot.gpt); // /gpt
bot.onCommand(/\/date/, bot.date); // /date
bot.onCommand(/\/message/, bot.message); // /message
bot.onCommand(/\/profile/, bot.profile); // /profile - если пользователь наберет эту команду то вызовится функция bot.profile
bot.onCommand(/\/opener/, bot.opener);

bot.onTextMessage(bot.hello);
bot.onButtonCallback(/^date_.*/, bot.dateButton) // Все строки которые начинаются с date_, . значит любой символ, * значит любое колличество любых символов
bot.onButtonCallback(/^message_.*/, bot.messageButton)
bot.onButtonCallback(/^.*/, bot.helloButton) // any string

