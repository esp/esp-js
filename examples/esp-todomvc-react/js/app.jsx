/*global React, Router*/
var app = app || {};

(function () {
    "use strict";

    var Header = app.Header,
        Main = app.Main,
        Footer = app.Footer;

    var TodoApp = React.createClass({

        componentDidMount: function () {
            var router = Router({
                "/": this.showAll,
                "/active": this.showActive,
                "/completed": this.showComplete
            });
            router.init("/");
        },

        showAll: function () {
            this.props.router.publishEvent("todoList", "filterChanged", { filter: app.model.Filter.all });
        },

        showActive: function () {
            this.props.router.publishEvent("todoList", "filterChanged", { filter: app.model.Filter.active });
        },

        showComplete: function () {
            this.props.router.publishEvent("todoList", "filterChanged", { filter: app.model.Filter.complete });
        },

        render: function () {
            var model = this.props.model,
                router = this.props.router;
            return (
                <div>
                    <Header router={router} />
                    <Main model={model.main}
                          router={router}
                        />
                    <Footer model={model.footer}
                            router={router}
                        />
                </div>
            );
        }
    });

    var router = new esp.Router();
    router
        .getModelObservable("todoList")
        .observe(function(model) {
            React.render(
                <TodoApp model={model}
                         router={router}/>,
                document.getElementById("todoapp")
            );
        });

    var modelBootstrapper = new app.model.ModelBootstrapper(router);
    modelBootstrapper.start();
    router.publishEvent("todoList", "initEvent", {});
}());