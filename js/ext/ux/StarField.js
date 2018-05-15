Ext.namespace('Ext.ux.form');
Ext.ux.form.StarField = Ext.extend(Ext.form.Field, {
	actionMode: 'wrap',

	onRender : function(ct, position){
		this.autoCreate = {
			id: this.id,
			name: this.name,
			type: 'hidden',
			tag: 'input'
		};
		Ext.ux.form.StarField.superclass.onRender.call(this, ct, position);
		this.wrap = this.el.wrap({cls: 'x-form-field-wrap rating-star'});
		this.resizeEl = this.positionEl = this.wrap;

		this.stars = [this.wrap.createChild({tag: 'li', cls: 'fa fa-fw fa-minus-circle unsel', 'data-rating':0})];
		for (var i = 1 ; i <= 5 ; i++) {
			this.stars.push(this.wrap.createChild({tag: 'li', cls: 'fa fa-fw fa-star unsel', 'data-rating':i}))
		}
	},

	initEvents : function(){
		Ext.ux.form.StarField.superclass.initEvents.call(this);
		this.wrap.on('click', function(e) {
			var v = this.getValue();
			var r = e.getTarget().dataset.rating;
			if (r) {this.setValue(r);}
			this.fireEvent('change', this, r, v);
		}, this);
	},

	onChange : function(el, v){
		this.setValue(v, true);
	},

	setValue : function(v, silent) {
		if(!silent){
			//show selected stars
			Ext.each(this.stars, function(el) {
				if (el.dom.dataset.rating > 0) {
					if (el.dom.dataset.rating <= v) {
						el.removeClass('unsel');
					} else {
						el.addClass('unsel');
					}
				}
			});
		}
		return Ext.ux.form.StarField.superclass.setValue.call(this, v);
	}
});

Ext.reg('starfield', Ext.ux.form.StarField);