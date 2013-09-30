/**
 * Created by tym32167 on 28.09.13.
 */


// Суть примера такова:
// У нас есть набор страниц, которые мы сделали. Навигация между страницами
// работает с использованием хеша. Страницы эти мы можем добавлять, удалять и изменять.
// Таким образом, мы сделали некое подобие простейшей CMS для SPA
(function ($) {
    $(function () {

        // Конструктор для страницы
        var PageItem = Backbone.Model.extend({

            // Значения по умолчанию
            defaults:{
                title:'default page',
                hash:'index',
                content:'default content'
            }
        });

        // Конструктор представления для рендеринга страницы в области навигации
        var PageViewNav = Backbone.View.extend({
            // Тег контейнера, в котором будет рендериться все представление
            tagName:'li',

            // Инициализация.
            initialize: function() {

                // Перерисовываем если модель изменяется
                this.listenTo(this.model, 'change', this.render);

                // Удаляем представление, если модель удалена
                this.listenTo(this.model, 'destroy', this.remove);
            },

            // Мы заводим собственное поле template - своеобразный кеш для переменной.
            // То есть мы могли бы и при рендеринге каждый раз получать этот темплейт, но чтобы
            // не быть расточительными, сохраним эту переменную сразу
            template: _.template($('#page-nav-template').text()),

            // Метод занимается отображением нашего представления.
            // По сути мы просто применяем нашу модель к шаблону (темплейту)
            render:function(){
                this.$el.html(this.template(this.model.attributes));
                return this;
            }
        });

        // Конструктор представления для рендеринга контента страницы
        var PageView = Backbone.View.extend({

            // Тег контейнера, в котором будет рендериться все представление
            tagName:'div',

            // Привязка событий
            events: {
                'blur div.view': 'save',
                'blur div.title': 'save',
                'click button#del': 'delete'
            },

            // Инициализация.
            initialize: function() {

                // Перерисовываем если модель изменяется
                this.listenTo(this.model, 'change', this.render);

                // Удаляем представление, если модель удалена
                this.listenTo(this.model, 'destroy', this.remove);
            },

            // Мы заводим собственное поле template - своеобразный кеш для переменной.
            // То есть мы могли бы и при рендеринге каждый раз получать этот темплейт, но чтобы
            // не быть расточительными, сохраним эту переменную сразу
            template: _.template($('#page-view-template').text()),

            // Метод занимается отображением нашего представления.
            // По сути мы просто применяем нашу модель к шаблону (темплейту)
            render:function(){
                document.title = this.model.get('title');
                this.$el.html(this.template(this.model.attributes));
                return this;
            },

            // Метод сохраняет состояние нашей модели, вызывает событие модели change.
            // Срабатывает по событию.
            save:function(){
                this.model.save({content:$('div.view').html(), title:$('div.title').text()});
            },

            // Метод для удаления модели. Срабатывает по событияю.
            delete:function(){
                this.model.destroy();
            }
        });

        // Конструктор коллекции страниц
        var PageCollection = Backbone.Collection.extend({
            // Указываем, с каким типом модедей будем работать
            model:PageItem,

            // Устанавливаем хранилище для элементов страниц - локальное хранилище
            localStorage: new Backbone.LocalStorage("pages")
        });

        // Коллекция страниц. Инициализируем её тут, так как далее в определениях
        // предсталения и роутере будем эту коллекцию использовать
        var pages = new PageCollection();

        // Конструктор предсталения нашего приложения
        var AppView = Backbone.View.extend({
            el: $('.app'),
            events: {
                // Привязываемся к кнопке - прописываем метод для добавления страницы
                'click button#add': 'add'
            },
            initialize: function () {

                // Привязываемся к событияю добавления страницы в коллекцию страниц
                pages.bind('add', this.addItem);

                // Загружаем сохраненные ранее страницы из локального хранилища
                pages.fetch();
            },

            // Событие добаления элемента в коллекцию.
            // Тут нужно создать представление для модели, выполнить рендер и
            // сохранить результат в DOM
            addItem: function (model) {
                var view = new PageViewNav({model: model});
                view.render();
                $('.nav.navbar-nav').append(view.el);
            },

            // Добавление новой страницы. По сути все просто -
            // получаем введеные пользователем значения полей,
            // добавляем новую модель в коллекцию и очищаем поля
            add: function () {
                pages.create({
                    content: $('#content').val(),
                    title: $('#title').val(),
                    hash: $('#hash').val()
                });
                $('#content').val('');
                $('#title').val('');
                $('#hash').val('');
            }
        });


        // Конструктор роутера
        var WorkspaceRouter = Backbone.Router.extend({

            routes: {
                // маршрут для перехвата выбранной страницы
                "pages/:hash":   "page",  // #pages/hash

                // пытаемся отловить все другие маршруты, чтобы
                // если не удастся сопоставить маршут странице - просто
                // затереть место, где выводится текущая страница.
                '':"default",
                '*query':"default"
            },

            // Если по хешу мы можем найти нашу страницу - то мы должны её отрендерить,
            // иначе просто показать пустое место
            page: function(hash) {
                var page =  pages.findWhere({hash:hash});
                if (page){
                    var view = new PageView({model: page});
                    view.render();
                    $('.content').html(view.el);
                }
                else
                    $('.content').empty();
            },

            // затираем на месте страницы все контролы
            default:function(){
                $('.content').empty();
            }
        });

        // Предсталение нашего приложения - представление высокого уровня
        // Инициализируем его первым, так как тут подкачиваются данные из
        // локального хранилица
        var app = new AppView();

        // Роутер
        var router = new WorkspaceRouter();

        // Запускаем историю.
        Backbone.history.start();
    });
})(jQuery);
