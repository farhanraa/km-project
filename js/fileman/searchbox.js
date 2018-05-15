FR.components.SearchBox = Ext.extend(Ext.form.ComboBox, {
	searchParams: {}, searchPath: false, disabled: true,
	initComponent: function() {
		Ext.apply(this, {
			ctCls:'search-field', minChars: 2, queryParam: 'keyword', listWidth: 258,
			emptyText: FR.T('Search'), itemSelector: 'div.fr-search-field-item',
			listClass: 'fr-search-list', hideTrigger: true, tpl: new Ext.XTemplate(
				'<tpl for=".">' +
				'<div class="fr-search-field-item" title="{path}">' +
				'<div style="float:left;">' +
				'<div class="ico fr-thumbnail" style="background-image:url(\'{[this.getIcon(values)]}\')"></div>' +
				'<div class="filename">{filename}</div>' +
				'</div>' +
				'<div class="size">{nice_filesize}</div><div style="clear:both;"></div>' +
				'</div>' +
				'</tpl>', {
					getIcon: function(values) {
						if (values.isFolder) {
							return 'images/fico/folder-gray.png';
						} else {
							if (values.hasThumb) {
								return FR.UI.getThumbURL({
									path: values.path+'/'+values.filename
								});
							} else {
								return 'images/fico/'+values.icon;
							}
						}
					}}),
			store: new Ext.data.JsonStore({
				searchBox: this,
				url: FR.baseURL+'/?module=search&section=ajax&page=quicksearch',
				root: 'files', idProperty: 'id',
				fields: [
					{name: 'id', mapping: 'id'},
					{name: 'filename', mapping: 'n'},
					{name: 'isFolder', mapping: 'dir'},
					{name: 'hasThumb', mapping: 'th'},
					{name: 'path', mapping: 'p'},
					{name: 'nice_filesize', mapping: 'ns'},
					{name: 'icon', mapping: 'i'}
				],
				listeners: {
					'beforeload': function() {
						this.setBaseParam('path', this.searchBox.searchPath);
						this.searchBox.showMoreBtn.hide();
					},
					'load': function() {
						this.searchBox.showMoreBtn.show();
					}
				}
			}),
			valueField: 'n', displayField: 'n',
			listeners: {
				'select': function(c, r) {this.customReset();FR.utils.locateItem(r.data.path, r.data.filename);},
				'render': function() {this.el.removeClass('x-form-text');}
			}}
		);
		FR.components.SearchBox.superclass.initComponent.apply(this, arguments);
	},
	doSearch: function(searchType) {
		if (searchType) {this.searchParams.searchType = searchType;}
		this.searchParams.keyword = this.getRawValue();
		this.searchParams.searchPath = this.searchPath;
		FR.utils.doSearch(this.searchParams);
		this.customReset();
	},
	customReset: function() {
		this.reset();
		this.clearValue();
		this.lastQuery = false;
		this.hasFocus = false;
		this.postBlur();
		FR.UI.gridPanel.getStore().clearFilter();
	},
	initList: function() {
		FR.components.SearchBox.superclass.initList.apply(this, arguments);
		this.extr = this.list.createChild({});
		this.showMoreBtn = new Ext.Toolbar.Button({
			text: FR.T('Show more...'), cls:'fr-btn-smaller',
			handler: function(){this.searchParams.searchType = 'filename';this.doSearch();}, scope: this
		});
		new Ext.Toolbar({
			renderTo: this.extr, style: 'padding:3px',
			items: ['&nbsp;', '->', this.showMoreBtn]
		});
		this.assetHeight += this.extr.getHeight();
	},
	setSearchFolder: function(path, text) {
		if (!path) {
			this.disable();
			text = '';
			FR.UI.actions.searchOpts.disable();
		} else {
			this.enable();
			FR.UI.actions.searchOpts.enable();
		}
		this.blur();
		this.searchPath = path;
		this.setRawValue();
		this.emptyText = FR.T('Search')+' '+text;
		this.applyEmptyText();
	}
});