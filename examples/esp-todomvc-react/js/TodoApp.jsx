/*global React,window,app*/
window.app = window.app || {};

(function () {
	'use strict';

	var Header = app.Header,
		MainSection = app.MainSection,
		Footer = app.Footer;

	app.TodoApp = React.createClass({

		componentWillMount: function () {
			this.props.router
				.getModelObservable(this.props.modelId)
				.observe(function (model) {
					this.setState({ model: model });
				}.bind(this));
		},

		render: function () {
			if (this.state === null) {
				return null;
			}

			var model = this.state.model;
			var router = this.props.router;
			var main;
			var footer;

			if (model.mainSection.visible) {
				main =
						<MainSection
							model={model.mainSection}
							router={router}
							modelId={this.props.modelId}
						/>;
			}

			if (model.footer.visible) {
				footer =
						<Footer
							model={model.footer}
							router={router}
							modelId={this.props.modelId}
						/>;
			}

			return (
				<div>
					<Header
						router={router}
						modelId={this.props.modelId}
					/>
					{main}
					{footer}
				</div>
			);
		}
	});
}());