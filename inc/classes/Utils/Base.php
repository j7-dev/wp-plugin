<?php
/**
 * Base
 */

declare (strict_types = 1);

namespace J7\WpPlugin\Utils;

if ( class_exists( 'J7\WpPlugin\Utils\Base' ) ) {
	return;
}
/**
 * Class Base
 */
abstract class Base {
	const DEFAULT_IMAGE = 'http://1.gravatar.com/avatar/1c39955b5fe5ae1bf51a77642f052848?s=96&d=mm&r=g';
}
