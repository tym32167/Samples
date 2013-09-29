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
            defaults:{
                title:'default page',
                hash:'index',
                content:'default content'
            }
        });

        // Конструктор коллекции страниц
        var PageCollection = Backbone.Collection.extend({
            model:PageItem,
            localStorage: new Backbone.LocalStorage("pages")
        });

        // Коллекция страниц
        var pages = new PageCollection();

        // Конструктор представления для рендеринга контента страницы
        var PageView = Backbone.View.extend({
            tagName:'div',
            events: {
                'blur div.view': 'save',
                'click button#del': 'delete'
            },

            initialize: function() {
                this.listenTo(this.model, 'change', this.render);
                this.listenTo(this.model, 'destroy', this.remove);
            },

            template: _.template($('#page-view-template').text()),
            render:function(){
                document.title = this.model.get('title');
                this.$el.html(this.template(this.model.attributes));
                return this;
            },
            save:function(){
                this.model.save({content:$('div.view').html()});
            },

            delete:function(){
                this.model.destroy();
            }
        });

        // Конструктор представления для рендеринга страницы в области навигации
        var PageViewNav = Backbone.View.extend({
            tagName:'li',

            initialize: function() {
                this.listenTo(this.model, 'change', this.render);
                this.listenTo(this.model, 'destroy', this.remove);
            },

            template: _.template($('#page-nav-template').text()),
            render:function(){
                this.$el.html(this.template(this.model.attributes));
                return this;
            }
        });

        // Конструктор предсталение нашего приложения
        var AppView = Backbone.View.extend({
            el: $('.app'),
            events: {
                'click button#add': 'add'
            },
            initialize: function () {
                pages.bind('add', this.addItem);
                pages.fetch();
            },
            addItem: function (model) {
                var view = new PageViewNav({model: model});
                view.render();
                $('.nav.navbar-nav').append(view.el);
            },
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
                "pages/:hash":   "page"  // #pages/hash
            },

            page: function(hash) {
                var page =  pages.findWhere({hash:hash});
                if (page){
                    var view = new PageView({model: page});
                    view.render();
                    $('.content').html(view.el);
                }
            }
        });

        // Роутер
        var router = new WorkspaceRouter();

        // Запускаем историю
        Backbone.history.start();

        // Предсталение нашего приложения - представление высокого уровня
        var app = new AppView();
    });
})(jQuery);
