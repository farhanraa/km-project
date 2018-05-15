FR.components.detailsPanel = Ext.extend(Ext.Panel, {
	layout: 'border',
	metadataCache: new Ext.util.MixedCollection(),
	title: '<i class="fa fa-fw fa-info fa-2x"></i>',
	cls: 'fr-details-panel',
	hidePreview: false,
	lastPath: false,
	initComponent: function() {
		this.metaLoaderTask = new Ext.util.DelayedTask(function(){this.loadMeta();}, this);
		this.folderIcon = '<i class="fa fa-folder"></i>';
		var ths = this;
		Ext.apply(this, {
			items: [
				{
					region: 'north', cls: 'north',
					height: 65,
					listeners: {
						'afterrender': function() {
							ths.titleBox = this.body.createChild({
								tag: 'div',
								children: [
									{
										tag: 'div', cls: 'title',
										children: [
											{tag: 'div', cls: 'icon'},
											{tag: 'div', cls: 'filename'}
										]
									}
								]
							});
							var title = ths.titleBox.first();
							ths.iconEl = title.first();
							ths.fileNameEl = title.last();

							this.body.on('contextmenu', function() {
								FR.UI.gridPanel.showContextMenu();
							});
						}
					}
				},
				{
					region: 'center', layout: 'fit', autoScroll: true, bodyStyle: 'padding-bottom:15px',
					listeners: {
						'afterrender': function() {

							ths.thumbContainer = this.body.createChild({tag: 'div', cls: 'fr-details-thumb', children: [{tag: 'img'}]});
							ths.thumbContainer.enableDisplayMode('block');
							ths.thumbImg = Ext.get(ths.thumbContainer.first());
							ths.thumbImg.on('load', function () {
								if (!this.dom) {return false;}
								var w = ths.getWidth()-40;
								var naturalWidth = this.dom.naturalWidth;
								if (naturalWidth < w) {
									w = naturalWidth;
								}
								this.set({width: w});
								ths.thumbContainer.show();
							});
							ths.thumbContainer.first().on('click', function() {
								if (ths.item.filetype == 'img') {
									FR.UI.imagePreview.init(ths.item);
								} else {
									FR.utils.showPreview(ths.item);
								}
							}, this);

							ths.infoEl = this.body.createChild({tag: 'div', cls: 'fr-details-fields'});
							ths.infoEl.enableDisplayMode('block');

							if (Settings.ui_enable_rating) {
								var id = 'ratingField'+this.id;
								ths.ratingEl = this.body.createChild({
									tag: 'div', cls: 'fr-details-fields', style:'margin-top:0',
									children: [
										{
											tag: 'div', cls: 'field',
											children: [
												{tag: 'div', cls: 'name', html: FR.T('Rating')},
												{tag: 'div', cls: 'value', id: id}
											]
										}
									]
								});
								ths.ratingField = new Ext.ux.form.StarField({
									renderTo: id,
									listeners: {
										'change': function(f, v) {
											FR.actions.setMetadata({
												params: {
													path: ths.item.data.path,
													'fields[rating]': v
												},
												callback: function(rs, opts) {
													if (!rs.success) {return false;}
													this.updateCachedMeta(opts.params.path, 'rating', opts.params['fields[rating]']);
												}, scope: ths
											});
										}, scope: this
									}
								});
								ths.ratingEl.enableDisplayMode('block');
							}

							ths.metadataEl = this.body.createChild({tag: 'div', cls: 'fr-details-fields'});
							ths.metadataEl.enableDisplayMode('block');

							ths.readMeEl = this.body.createChild({tag: 'div', cls: 'fr-details-readme'});
							ths.readMeEl.enableDisplayMode('block');
						}
					}
				},
				{
					region: 'south', xtype: 'tagsfield', ref: 'tagsField',
					height: 50, emptyText: FR.T('Add tags...'), listAlign : 'tl-bl', maxHeight: 45,
					locked: true, allowUnlock: !User.perms.read_only,
					listeners: {
						'lockedWidthChanges': function(f, items) {ths.saveTags(items);},
						'lockedItemClick': function(f, item) {FR.actions.filterMeta('tag', item.value, 'exact');}
					}
				}
			],
			listeners: {
				'activate': function(p){p.active = true;},
				'deactivate': function(p) {p.active = false;},
				'resize': function() {if (this.active && this.item) {this.updateQuickView();}},
				scope: this
			}
		});
		FR.components.detailsPanel.superclass.initComponent.apply(this, arguments);
	},
	setReadMe: function(v) {this.readMe = v;},
	gridSelChange: function() {
		if (!this.active) {return false;}
		if (!FR.UI.tree.currentSelectedNode) {return false;}
		this.countSel = FR.UI.gridPanel.countSel;
		this.countAll = FR.UI.gridPanel.store.getTotalCount();
		this.item = FR.currentSelectedFile;
		this.updateQuickView();
	},
	setItem: function(item) {
		if (!this.active) {return false;}
		this.item = item;
		this.countSel = 1;
		this.updateQuickView();
	},
	reset: function() {
		this.metaLoaderTask.cancel();
		this.readMeEl.hide();
		this.infoEl.hide().update('');
		if (Settings.ui_enable_rating) {
			this.ratingEl.hide();
			this.ratingField.setValue(0);
		}
		this.metadataEl.hide().update('');
		this.thumbContainer.hide();
		this.tagsField.hide();
		this.tagsField.reset();
		this.doLayout(true);
	},
	updateHeaderTitle: function() {
		var title;
		if (this.countSel == 1) {
			title = this.item.data.isFolder ? this.item.data.filename : FR.utils.dimExt(this.item.data.filename);
		} else {
			title = FR.UI.tree.currentSelectedNode.text;
		}
		this.fileNameEl.update(title);
	},
	updateHeaderIcon: function() {
		var icon;
		if (this.countSel == 1) {
			if (this.item.data.isFolder) {
				icon = this.folderIcon;
			} else {
				var iconSrc = 'images/fico/' + this.item.data.icon;
				icon = '<img src="' + iconSrc + '" height="34" align="left" style="margin-right:5px;" />';
			}
		} else {
			var treeNode = FR.UI.tree.currentSelectedNode.attributes;
			if (treeNode.iconCls == 'avatar') {
				icon = '<i class="basicAvatar" style="display:inline-block;background-image:url(a/?uid='+treeNode.uid+')"></i>';
			} else {
				var iconCls = treeNode.iconCls || 'fa-folder';
				icon = '<i class="fa ' + iconCls + '"></i>';
			}
		}
		this.iconEl.update(icon);
	},
	showStatus: function() {
		var size = '';
		if (this.countAll == 0) {
			var statusText = FR.T('There are no files in this folder.');
		} else {
			var sel;
			if (this.countSel == 0) {
				sel = FR.UI.gridPanel.store.data.items;
				if (this.countAll == 1) {
					statusText = FR.T('One item');
				} else if (this.countAll > 0) {
					statusText = FR.T('%1 items').replace('%1', this.countAll);
				}
			} else {
				sel = FR.UI.gridPanel.selModel.getSelections();
				statusText = FR.T('%1 items selected').replace('%1', this.countSel);
			}
			size = 0;
			Ext.each(sel, function (item) {
				if (item.data.isFolder) {
					size = false;
					return false;
				}
				size += parseInt(item.data.filesize);
			});
			if (size > 0) {
				size = Ext.util.Format.fileSize(size);
			} else {
				size = '';
			}
		}
		var info = '<div class="status">' +
			'<div class="text">'+statusText+'</div>' +
			'<div class="size">'+size+'</div>' +
			'<div style="clear:both"></div><div>';
		this.infoEl.update(info).show();
	},
	showPreview: function() {
		if (
			this.hidePreview ||
			FR.UI.gridPanel.view.viewMode == 'photos' ||
			this.item.data.filetype == 'mp3' ||
			!this.item.data.thumb
		) {return false;}

		var imageSrc;
		if (this.item.data.thumbImg) {
			imageSrc = this.item.data.thumbImg.dom.src;
		} else {
			imageSrc = FR.UI.getThumbURL(this.item.data);
		}
		this.thumbImg.set({src: imageSrc});
	},
	showReadMe: function() {
		if (!this.readMe) {return false;}
		if (FR.currentPath != this.lastPath) {
			var url =  FR.baseURL+'/?section=utils&page=readme&path='+encodeURIComponent(FR.currentPath);
			this.readMeEl.update('<iframe frameborder="0" width="100%" src="'+url+'"></iframe>');
			this.lastPath = FR.currentPath;
		}
		this.readMeEl.show();
	},
	onReadMeLoad: function(h) {
		this.readMeEl.first().setHeight(h+80);
	},
	updateQuickView: function() {
		if (!this.active) {return false;}
		this.reset();
		this.updateHeaderIcon();
		this.updateHeaderTitle();
		if (this.countSel == 1) {
			this.showPreview();
			this.showDetails();
			if (User.perms.metadata) {
				this.showMetaData();
			}
		} else {
			if (Settings.ui_enable_rating) {
				this.ratingEl.hide();
			}
			this.tagsField.hide();
			this.showStatus();
			this.showReadMe();
		}
	},
	showDetails: function() {
		var fields = [];
		var d = this.item.data;
		if (d.label) {
			fields.push({name: FR.T('Label'), values: [{html: d.label.html}]});
		}
		if (!FR.currentSectionIsVirtual && ['recent', 'starred', 'search', 'shares', 'webLinked', 'media'].indexOf(FR.currentSection) !== -1) {
			fields.push({name: FR.T('Location'), type: 'locate', values: [d.path]});
		}
		if (FR.currentSection == 'trash') {
			fields.push({name: FR.T('Deleted from'), values: [d.trash_deleted_from]});
		}
		if (d.type) {
			fields.push({name: FR.T('Type'), values: [d.type]});
		}
		if (!d.isFolder) {
			fields.push({
				name: FR.T('Size'),
				qtip: Ext.util.Format.number(d.filesize, '0,000') + ' ' + FR.T('bytes'),
				values: [d.nice_filesize]
			});
		}
		if ((d.modified && d.created) && (d.modified.getTime() != d.created.getTime())) {
			fields.push({
				name: FR.T('Modified'),
				qtip: d.modified,
				values: [(Settings.grid_short_date ? d.modifiedHuman : Ext.util.Format.date(d.modified, FR.T('Date Format: Files')))]
			});
		}
		if (d.created) {
			fields.push({
				name: FR.T('Created'),
				qtip: d.created,
				values: [(Settings.grid_short_date ? d.createdHuman : Ext.util.Format.date(d.created, FR.T('Date Format: Files')))]
			});
		}
		if (d.lockInfo) {
			fields.push({
				name: FR.T('Locked by'),
				values: [d.lockInfo]
			});
		}
		if (d.version > 1) {
			fields.push({
				name: FR.T('Version'),
				values: [{tag: 'a', href:'javascript:FR.actions.openVersions();', html: d.version.toString()}]
			});
		}
		this.infoEl.update('').show();
		this.infoEl.appendChild(this.makeFieldset({fields: fields}));
	},
	showMetaData: function() {
		if (Settings.ui_enable_rating) {
			this.ratingEl.show();
		}
		this.tagsField.hide();
		if (FR.currentSectionIsVirtual) {return false;}
		if (this.metadataCache.containsKey(this.item.data.path)) {
			this.applyMetadata(this.metadataCache.get(this.item.data.path));
		} else {
			this.metaLoaderTask.delay(500);
		}
	},
	loadMeta: function() {
		if (!this.item) {return false;}
		this.metadataEl.update('<span style="color:silver;font-size:9px;margin:5px;">'+FR.T('Loading metadata...')+'</span>').show();
		Ext.Ajax.request({
			url: FR.baseURL+'/?module=metadata&section=ajax&page=quick_view',
			params: {path: this.item.data.path},
			callback: function(opts, succ, req) {
				if (!this.item) {return false;}
				try {
					var rs = Ext.decode(req.responseText);
				} catch (er){return false;}
				var path = this.item.data.path;
				if (!this.metadataCache.containsKey(path)) {
					this.metadataCache.add(path, rs);
				} else {
					this.metadataCache.replace(path, rs);
				}
				this.applyMetadata(rs);
			}, scope: this
		});
	},
	applyMetadata: function(rs) {
		this.metadataEl.hide();
		this.tagsField.show();
		if (rs.success) {
			var d = rs.data;
			if (Settings.ui_enable_rating) {
				this.ratingField.setValue(d.rating);
			}

			this.metadataEl.update().show();
			Ext.each(d.metadata.fieldsets, function (set) {
				this.metadataEl.appendChild(this.makeFieldset(set));
			}, this);

			var gps = d.metadata.gps;
			if (gps && Settings.google_static_maps_api_key) {
				this.metadataEl.appendChild(this.makeFieldset({
					name: FR.T('Location'),
					fields: [
						{
							tag: 'div',
							cls: 'map',
							html: '<a href="https://www.google.com/maps/place/' + gps.x + ',' + gps.y + '" target="_blank"><img src="https://maps.googleapis.com/maps/api/staticmap?size=300x300&zoom=11&scale=2&&markers=color:red|' + gps.x + ',' + gps.y + '&key=' + encodeURIComponent(Settings.google_static_maps_api_key) + '" width="95%" border="0" /></a>'
						}
					]
				}));
			}

			if (d.tags.length == 0) {
				if (User.perms.read_only || (FR.currentFolderPerms && !FR.currentFolderPerms.alter)) {
					this.tagsField.hide();
				} else {
					this.tagsField.unlock();
				}
			} else {
				if (d.tags.length == 0) {
					this.tagsField.unlock();
				} else {
					this.tagsField.lock();
				}
				this.tagsField.suspendEvents(false);
				this.tagsField.setValueEx(d.tags);
				this.tagsField.resumeEvents();
			}
		} else {
			if (User.perms.read_only) {this.tagsField.hide();} else {this.tagsField.unlock();}
		}
		this.doLayout(true);
	},
	makeFieldset: function(set) {
		var obj = {tag: 'div', children: []};
		if (set.name) {
			var title = {tag: 'div', cls: 'fieldsetname', children: []};
			title.children.push(set.name);
			if (set.id && !User.perms.read_only) {
				title.children.push({tag: 'a', cls:'editIcon', html: '<li class="fa fa-edit"></li>'});
			}
			obj.children.push(title);
		}
		Ext.each(set.fields, function(field) {
			if (!field.name) {
				obj.children.push(field);
				return true;
			}
			var valueObj = {tag: 'div', cls: 'value', children: []};
			Ext.each(field.values, function (val) {
				if (field.type == 'large') {
					val = {tag: 'div', html: val};
				} else if (field.type == 'locate') {
					var pInfo = FR.utils.pathInfo(val);
					val = {tag: 'div', html: '<a href="javascript:;" onclick="FR.utils.locateItem(\''+pInfo.dirname+'\', \''+pInfo.basename+'\')">'+FR.utils.humanFilePath(pInfo.dirname)+'</a>'};
				} else {
					if (field.id) {
						if (field.type == 'date') {
							val = {tag: 'div', children: [{
								tag: 'a', cls: 'search',
									'data-field-id': field.id,
									'data-smode': 'begins',
									html: val.substr(0, 10)
								}, val.substr(10)]};
						} else {
							val = {tag: 'a', cls: 'search', 'data-field-id': field.id, html: val};
						}
					}
				}
				var v = {tag: 'div', children: [val]};
				if (field.qtip) {v.title = field.qtip;}
				valueObj.children.push(v);
			});
			obj.children.push({
				tag: 'div', cls: 'field',
				children: [
					{tag: 'div', cls: 'name', children: [field.name]},
					valueObj
				]
			});
		});
		var div = Ext.DomHelper.createDom(obj);
		Ext.each(Ext.fly(div).query('a.search'), function (a) {
			Ext.fly(a).on('click', function() {
				FR.actions.filterMeta(this.dataset.fieldId, this.innerText, (this.dataset.smode || 'exact'));
			}, a);
		});
		Ext.each(Ext.fly(div).query('a.editIcon'), function (a) {
			Ext.fly(a).on('click', function() {this.editMeta();}, this);
		}, this);
		return div;
	},
	saveTags: function(tags) {
		var opts = {
			url: FR.baseURL+'/?module=metadata&section=tags&page=set',
			params: {'paths[]': this.item.data.path, 'tags[]': []},
			callback: function (rs, opts) {
				if (!rs.success) {return false;}
				this.updateCachedMeta(opts.params['paths[]'], 'tags', rs.tags);
			},
			scope: this
		};
		tags.each(function(tag) {
			opts.params['tags[]'].push(tag.value);
		});
		FR.actions.setMetadata(opts);
	},
	updateCachedMeta: function(path, field, val) {
		var data;
		/*if (path == this.item.data.path) {this.item.set(field, val);}*/
		if (this.metadataCache.containsKey(path)) {
			data = this.metadataCache.get(path);
			if (!data.data) {data.data = {};}
			data.data[field] = val;
			this.metadataCache.replace(path, data);
		} else {
			data = {success: true, data: {}};
			data.data[field] = val;
			this.metadataCache.add(path, data);
		}
	},
	editMeta: function() {
		FR.actions.openMetadata({title: this.item.data.filename, path: this.item.data.path});
	}
});
Ext.reg('FRDetailsPanel', FR.components.detailsPanel);