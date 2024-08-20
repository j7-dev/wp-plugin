<?php
/**
 * Front-end Entry
 */

declare(strict_types=1);

namespace J7\WpPlugin\FrontEnd;

if (class_exists('J7\WpPlugin\FrontEnd\Entry')) {
	return;
}
/**
 * Class Entry
 */
final class Entry {
	use \J7\WpUtils\Traits\SingletonTrait;

	/**
	 * Constructor
	 */
	public function __construct() {
	}
}
