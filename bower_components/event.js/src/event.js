var Events = {
  evnts: {},
  _hash: function(str){
    str.toUpperCase().replace(/\s/g,'');
    num = 0;
    for(var i in str){
      num += str.charCodeAt(i);
    }
    return num.toString();
  },
  on: function( evnt, func, prio ){
    prio = prio || 10;
    this.evnts[ evnt ] = this.evnts[ evnt ] || {};
    this.evnts[ evnt ][ prio ] = this.evnts[ evnt ][ prio ] || {};
    this.evnts[ evnt ][ prio ][ this._hash( func.toString() ) ] = func;
  },
  off: function( evnt, func ){
    if( this.evnts[ evnt ] ){
      if( func && typeof func === 'function' ){
        var func_hash = this._hash( func.toString() );
        for( var prio in this.evnts[ evnt ] ){
          for( var i in this.evnts[ evnt ][ prio ] ){
            if( i === func_hash ){
              delete this.evnts[ evnt ][ prio ][ i ];
            }
          }
        }
      } else {
        this.evnts[ evnt ] = {};
      }
    }
  },
  trigger: function(){
    arguments = Array.prototype.slice.call(arguments);
    evnt = arguments.shift();
    if( this.evnts[ evnt ] ){
      for( var prio in this.evnts[ evnt ] ){
        for( var i in this.evnts[ evnt ][ prio ] ){
          if( typeof this.evnts[ evnt ][ prio ][ i ] === 'function' ){
            this.evnts[ evnt ][ prio ][ i ].apply(this, arguments);
          }
        }
      }
    }
  }
};