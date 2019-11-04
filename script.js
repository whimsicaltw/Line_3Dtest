ar loader = new THREE.GLTFLoader();

loader.load( 'https://raw.githubusercontent.com/whimsicaltw/Line_3Dtest/master/model/test1.gltf', function( gltf ) {

    gltf.scene.traverse( function( node ) {

        if ( node instanceof THREE.Mesh ) { node.castShadow = true; }

    } );

    scene.add( gltf.scene );

} );
