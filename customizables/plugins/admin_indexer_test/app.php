<?php

class custom_admin_indexer_test extends \FileRun\Files\Plugin {

	static $localeSection = 'Custom Actions';

	function init() {
		$this->JSconfig = [
			'title' => self::t('Admin: Text Indexer Test'),
			'iconCls' => 'fa fa-fw fa-bug',
			"popup" => true,
			'width' => 500,
			'requires' => ['section-myfiles']
		];
	}

	function isDisabled() {
		global $settings;
		return (!$settings->search_enable || !\FileRun\Perms::isSuperUser());
	}

	function run() {
		$data = $this->prepareRead(['expect' => 'file']);

		$search = new \FileRun\Search();
		$tika = $search->getApacheTika();
		header('Content-type: text/plain; charset=UTF-8');
		try {
			echo \S::convert2UTF8($tika->getText($data['fullPath']));
		} catch(Exception $e) {
			echo $e->getMessage();
			return false;
		}
	}
}