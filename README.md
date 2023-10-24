node-red-contrib-remap
======================

A <a href="http://nodered.org" target="_new">Node-RED</a> node to remap the properties of
a simple msg object, in a semi-automatic way. The node configuration is self populated with
all of the sub-properties of the property selected. The user can then easily decide whether to
pass them through, drop them, or rename them to a different property.

This is useful when receiving data from an API that may have lots of extra properties that you
don't need, and some that just need re-labelling, e.g. latitude to lat for example.

**NOTE**: This node won't work inside a subflow as the editor instance never sees live messages so cannot be configured correctly. Use link call nodes instead if you need to call it from multiple places.

Install
-------

Either use the Manage Palette option in the Node-RED Editor menu, or run the following command in your Node-RED user directory - typically `~/.node-red`

    npm i node-red-contrib-remap

Usage
-----

The node is configured to work on a single property within a msg. You can leave the property blank to operate on the whole message.

You can set the default to either remove all unknown sub-properties or pass through all.

The configuration page will be blank until some test messages have arrived. 

Once some messsages have arrived you can configure the node to then remove the property, passthru the property, or rename that property.

 - &#8856;  Remove this property
 - &#10132; Allow this property through unchanged
 - &#8658;  Rename this property

If you rename two items to have the same new label, then if they are objects they will be merged... If not the last one to be set will overwrite the other.

If the resulting new object is blank you can optionally drop the entire msg.

You can also then specify the output property that this new object should be attached to. If this is different to the incoming property then the incoming property is removed from the message. 

![Remap Screenshot](https://dceejay.github.io/pages/images/remap.png)
