<?php

require_once 'sitio/src/AppBase.php';
require_once 'sitio/src/Vista.php';

/*
	Dummy data para el ejemplo. Debe crear la logica para cargar los datos des la BD.
*/
class Usuarios extends AppBase
{
	
	function __construct(Main $main)
	{
		parent::__construct($main);
		$this->metas = new Meta();
		$this->metas->setTitle("Página de usuario.");
	}
	public function verAction()
	{
		$data = array('msg' => '', 'estado' => 'exito');

		$data['campos'] = array('id', 'nombre', 'apellido', 'correo');
		$data['etiqueta'] = array('id' => 'ID', 'nombre' => 'Nombre', 'apellido' => 'Apellido', 'correo' => 'Correo');
		$data['datos'] = array('id' => 1, 'nombre' => 'Pedro', 'apellido' => 'Da Rosa', 'correo' => 'pedro2382329@test.dummy');

		return $this->view("sitio/layouts/default.phtml", $data, $this->metas, "sitio/views/general.phtml");
	}
	
	public function listadoAction()
	{
	    $data = array('msg' => '', 'estado' => 'exito');

        $vista = new Vista('usuarios', 'id,nombre,apellido,correo', '', 'usuarios', $this->db());
        $vista->procesar($this->main->getRequest());
        $data['vista'] = $vista;
		$data['vid'] = 0;
		$data['vistas_opciones'] = array(0 => 'Vista Defecto');
	    return $this->view("sitio/layouts/default.phtml", $data, $this->metas,  "sitio/views/general.phtml");
	}

}