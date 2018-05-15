FR.editSettings = {};
FR.editSettings.formPanel = new FR.components.editForm({
	title: FR.T('Branding options'),
	layout: 'form', bodyStyle: 'padding:10px;',
	labelWidth: 150, autoScroll: true,
	defaults: {width: 500},
	items: [
		{
			xtype: 'fieldset',
			title: FR.T('Login page'),
			defaults: {width: 250},
			items: [
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Title'),
					name: 'settings[ui_login_title]',
					value: FR.settings.ui_login_title
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Logo URL'),
					name: 'settings[ui_login_logo]',
					value: FR.settings.ui_login_logo
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Page background'),
					name: 'settings[ui_login_bg]',
					value: FR.settings.ui_login_bg,
					helpText: FR.T('For a background image type in a full URL.')+'<br>'+FR.T('For a background color type in a hexadecimal value, for example #EC6952')
				},
				{
					xtype: 'textarea',
					fieldLabel: FR.T('Welcome message'),
					name: 'settings[ui_login_text]',
					value: FR.settings.ui_login_text
				}
			]
		},
		{
			xtype: 'fieldset',
			defaults: {width: 250},
			items: [
				{
					xtype: 'textfield', ref:'app_title',
					fieldLabel: FR.T('Application title'),
					name: 'settings[app_title]',
					value: FR.settings.app_title
				},
				{
					xtype: 'checkbox', ref:'ui_title_logo',
					boxLabel: FR.T('Use title as logo'),
					width: 400, value: 1,
					name: 'settings[ui_title_logo]', checked: parseInt(FR.settings.ui_title_logo),
					listeners: {
						check: function(field, checked) {
							if (checked) {
								field.ownerCt.ui_logo_url.disable();
							} else {
								field.ownerCt.ui_logo_url.enable();
							}
						}
					}
				},
				{
					xtype: 'textfield', ref: 'ui_logo_url',
					fieldLabel: FR.T('Logo URL'),
					name: 'settings[ui_logo_url]',
					value: FR.settings.ui_logo_url,
					disabled: parseInt(FR.settings.ui_title_logo),
					helpText: FR.T('Recommended height for the image file is 38 pixels')
				},
				{
					xtype: 'textfield', ref: 'ui_logo_link_url',
					fieldLabel: FR.T('Logo link URL'),
					name: 'settings[ui_logo_link_url]',
					value: FR.settings.ui_logo_link_url,
					helpText: FR.T('This is the address to where the users are redirected when clicking the logo')
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Help URL'),
					name: 'settings[ui_help_url]',
					value: FR.settings.ui_help_url,
					helpText: FR.T('URL of your help and support page')
				},
				{
					xtype: 'textarea',
					fieldLabel: FR.T('Welcome message'),
					name: 'settings[ui_welcome_message]',
					value: FR.settings.ui_welcome_message
				}
			]
		},
		{
			xtype: 'fieldset',
			defaults: {width: 250},
			items: [
				{
					xtype: 'radiogroup', vertical: true, columns: 1,
					fieldLabel: FR.T('Color theme'),
					items: [
						{
							boxLabel: FR.T('Blue'),
							name: 'settings[ui_theme]',
							inputValue: 'blue',
							checked: (FR.settings.ui_theme == 'blue')
						},
						{
							boxLabel: FR.T('Green'),
							name: 'settings[ui_theme]',
							inputValue: 'green',
							checked: (FR.settings.ui_theme == 'green')
						},
						{
							boxLabel: FR.T('Red'),
							name: 'settings[ui_theme]',
							inputValue: 'red',
							checked: (FR.settings.ui_theme == 'red')
						},
						{
							boxLabel: FR.T('Custom'),
							name: 'settings[ui_theme]',
							inputValue: 'custom',
							checked: (FR.settings.ui_theme == 'custom'),
							helpText: FR.T('It requires you to create the CSS file "customizables/custom_theme.css".')+'<br />'+FR.T('Use the file "css/theme_blue.css" as the example.')
						}
					]
				}
			]
		}
	],
	tbar: [
		{
			text: FR.T('Save changes'), cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=cpanel&section=settings&action=save',
					maskText: 'Saving changes...',
					params: Ext.apply({
						'settings[ui_title_logo]': 0
					}, editForm.form.getValues())
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('appTab').add(FR.editSettings.formPanel);
Ext.getCmp('appTab').doLayout();