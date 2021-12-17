
function AjaxObjeto()
{
	var a = null;
	var d = ["Msxml2.XMLHTTP","Microsoft.XMLHTTP"];
	if(window.ActiveXObject)
	{
		for(var e = 0; e < d.length; e++)
		{
			try{ a = new ActiveXObject(d[e])}
			catch(f){}
		}
	}
	else 
	{
		a = new XMLHttpRequest;
	}
	return a;
}

function AjaxRequest(_exito,_fallo)
{
	var b = new AjaxObjeto();

	if(b != null)
	{
		b.onreadystatechange=function()
		{
			if(this.readyState == 4 && this.status == 200 && typeof _exito == "function")
			{
				_exito(this);
			}
			else if(this.readyState == 4 && this.status != 200)
			{
				if(typeof _fallo == "function")
				{
					_fallo(this);
				}
				else
				{
					console.info("Error en la respuesta ajax.");
					console.info(this.responseText);
				}
			}
		}
	}
	return b;
}
function obtenerCSRF()
{
	var a=document.getElementById("csrf");
	void 0!=a&&""!=a.value||console.info("error: no hay csrf");
	return a.value
}

function dimensionesNavegador()
{
    var w = 0, h = 0;
    if(typeof window.innerWidth != 'undefined'){w = window.innerWidth;h = window.innerHeight;} 
    else if(typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0){w =  document.documentElement.clientWidth;h = document.documentElement.clientHeight;}
    else{w = document.body.clientWidth;h = document.body.clientHeight;}
    return {'width':w, 'height': h};
}

function mostrar(i)
{
	if(i instanceof String)
	{
		try{document.querySelector(i).style.display = 'block'}catch(e){}
	}
	else if(i instanceof Element)
	{
		i.style.display = 'block';
	}
}
function ocultar(i)
{
	if(i instanceof String)
	{
		try{document.querySelector(i).style.display = 'none'}catch(e){}
	}
	else if(i instanceof Element)
	{
		i.style.display = 'none';
	}
}
function capitalizar(s)
{
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function vaciarSelect(s)
{
	if(!(s instanceof HTMLSelectElement))return;
	while(s.options.length > 0)s.remove(0);
}

function AppObjetos()
{
	this.estado = 'inactivo';
	this.msg = '';
	this.metas = null;				// objeto => {meta data}
	this.opciones = Array();  		// objeto => array({id : nombre})
    this.ajax = new AjaxObjeto();
    this.ajax_inicio = 0;

	this.cargarMeta();
}
AppObjetos.prototype.cargarMeta = function()
{
	this.estado = 'iniciando';
	this.ajax_inicio = Date.now();
    this.ajax.onreadystatechange = (this.comprobarCarga).bind(this, this.cargadorMeta);
    this.ajax.open('GET', '/api/objeto/describir/?o=todos', true);
    this.ajax.send('');
}
AppObjetos.prototype.cargarOpciones = function(_objeto)
{
	this.estado = 'iniciando';
	this.ajax_inicio = Date.now();
    this.ajax.onreadystatechange = (this.comprobarCarga).bind(this, this.cargadorOpciones);
    this.ajax.open('GET', '/api/objeto/opciones/?o='+encodeURIComponent(_objeto), true);
    this.ajax.send('');
}

AppObjetos.prototype.cargadorMeta = function(self, j)
{
	if(j['objetos'] == undefined)
	{
		self.estado = "error";
		self.msg = 'Parametro objetos no econtrado.';
		return;
	}
	self.estado = 'cargado';
	self.metas = j['objetos'];
}
AppObjetos.prototype.cargadorOpciones = function(self, j)
{
	if(j['opciones'] == undefined)
	{
		self.estado = "error";
		self.msg = 'Parametro opciones no econtrado.';
		return;
	}
	self.estado = 'cargado';
	self.opciones[j['objeto']] = j['opciones'];
}
AppObjetos.prototype.comprobarCarga = function(_cargador)
{
    if(this.ajax.readyState == 4)
    {
		var j;
		try
		{
			j = JSON.parse(this.ajax.responseText);
		}
		catch(e)
		{
			this.estado = 'error';
			this.msg = e.message;
			return;
		}
        
		if(this.ajax.status == 200 && j['estado'] == 'exito')
		{
			_cargador(this, j);
		}
		else
		{
            console.info("Error en la respuesta ajax.");
            console.info(this.ajax.responseText);
            console.info(j['msg']);
			this.estado = "error";
			this.msg = j['msg'];
		}
    }
    else if(this.ajax.readyState == 3)
    {
		this.estado = 'cargando';
        this.msg == 'Obteniendo datos... ('+ (Date.now() - this.ajax_inicio) +')';
    }
    else
    {
		this.estado = 'cargando';
        this.msg == 'Consultando datos... ('+ (Date.now() - this.ajax_inicio) +')';
    }

    if(Date.now() - this.ajax_inicio > 30000)
    {
        console.info("Demora en ajax");
		this.estado = 'error';
		this.msg = 'Tiempo de espera muy largo.';
    }
}
AppObjetos.prototype.listarObjetos = function()
{
	var lista = [];
	if(this.estado != 'cargado')return lista;

	for(obj in this.metas)
	{
		lista.push({'id':obj, 'etiqueta': capitalizar(obj)});
	}
	return lista;
}
AppObjetos.prototype.describirCampo = function(obj, camp)
{
	if(this.metas[obj] == undefined)return;
	if(this.metas[obj]['campos'] == undefined)return;
	if(this.metas[obj]['campos'][camp] == undefined)return;
	return this.metas[obj]['campos'][camp];
}
AppObjetos.prototype.opcionesObjeto = function(_objeto)
{
	if(this.opciones[_objeto] != undefined)return this.opciones[_objeto];
	return null;
}

window.addEventListener('load', function()
{
	
}, false);

