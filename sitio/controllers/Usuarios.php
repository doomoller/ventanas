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

		$tmp = array();
		$tmp[] = array('id' => '1', 'nombre' => 'Carlos', 'apellido' => 'Kartz', 'correo' => 'carloskartz@test.dummy');
        $tmp[] = array('id' => '2', 'nombre' => 'Gustavo', 'apellido' => 'Gomez', 'correo' => 'gustavo8282@test.dummy');
        $tmp[] = array('id' => '3', 'nombre' => 'Federico', 'apellido' => 'Perez', 'correo' => 'federico382193@test.dummy');
        $tmp[] = array('id' => '4', 'nombre' => 'Susana', 'apellido' => 'Rodriguez', 'correo' => 'susana3232@test.dummy');
        $tmp[] = array('id' => '5', 'nombre' => 'Maria', 'apellido' => 'Suarez', 'correo' => 'maria3232@test.dummy');
        $tmp[] = array('id' => '6', 'nombre' => 'Tereza', 'apellido' => 'Olivera', 'correo' => 'tereza3232@test.dummy');
        $tmp[] = array('id' => '7', 'nombre' => 'Julio', 'apellido' => 'Massino', 'correo' => 'julio232@test.dummy');
        $tmp[] = array('id' => '8', 'nombre' => 'Juan', 'apellido' => 'Bentancour', 'correo' => 'juan23232@test.dummy');
        $tmp[] = array('id' => '9', 'nombre' => 'Beatriz', 'apellido' => 'Vera', 'correo' => 'beatriz53453@test.dummy');
        $tmp[] = array('id' => '10', 'nombre' => 'Vanesa', 'apellido' => 'Garcia', 'correo' => 'vanesa43423@test.dummy');
		$tmp[] = array('id' => '11', 'nombre' => 'Hector', 'apellido' => 'Frank', 'correo' => 'hector3232@test.dummy');
        $tmp[] = array('id' => '12', 'nombre' => 'Damian', 'apellido' => 'Kal', 'correo' => 'damian2312@test.dummy');

		$r = $this->main->getRequest();
		$data['datos'] = $tmp[$r->getMetodoParametro('id') - 1];

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