<?php
/**
 * Bootstrap
 */

declare (strict_types = 1);

namespace J7\WpPlugin;

if ( class_exists( 'J7\WpPlugin\Bootstrap' ) ) {
	return;
}
/**
 * Class Bootstrap
 */
final class Bootstrap {
	use \J7\WpUtils\Traits\SingletonTrait;

	/**
	 * @var array
	 * Store instances of classes
	 */
	public $instances = [];

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->instances['FrontEnd\Entry'] = FrontEnd\Entry::instance();

		\add_action( 'admin_enqueue_scripts', [ __CLASS__, 'admin_enqueue_script' ] );
		\add_action( 'wp_enqueue_scripts', [ __CLASS__, 'frontend_enqueue_script' ] );
	}

	/**
	 * Admin Enqueue script
	 * You can load the script on demand
	 *
	 * @param string $hook current page hook
	 *
	 * @return void
	 */
	public static function admin_enqueue_script( $hook ): void {
		self::enqueue_script();
	}


	/**
	 * Front-end Enqueue script
	 * You can load the script on demand
	 *
	 * @return void
	 */
	public static function frontend_enqueue_script(): void {
		self::enqueue_script();
	}

	/**
	 * Enqueue script
	 * You can load the script on demand
	 *
	 * @return void
	 */
	public static function enqueue_script(): void {

		\wp_enqueue_script(
			Plugin::$kebab,
			Plugin::$url . '/js/dist/index.js',
			[ 'jquery' ],
			Plugin::$version,
			[
				'in_footer' => true,
				'strategy'  => 'async',
			]
		);

		\wp_enqueue_style(
			Plugin::$kebab,
			Plugin::$url . '/js/dist/assets/css/index.css',
			[],
			Plugin::$version
		);
	}
}
