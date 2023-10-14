
module.exports = function(RED) {
    "use strict";

    var remap = {};

    function RemapNode(n) {
        RED.nodes.createNode(this,n);
        this.pass = n.pass || "_BLOCK_";
        this.map = n.map;
        this.property = n.property;
        this.outproperty = n.outproperty||n.property||"payload";
        var node = this;
        remap[node.id] = node.map;
        node.on("input", function(msg) {
            var value;
            if (typeof node.property === "string" && node.property.length > 0) {
                value = RED.util.getMessageProperty(msg,node.property);
            }
            else { value = msg; }
            if (value !== undefined) {
                const op = {};
                for (const property in value) {
                    node.map[property] = node.map[property] ?? node.pass;
                    if (node.map[property] === "_ALLOW_") {
                        op[property] = value[property];
                    }
                    else if (node.map[property] !== "_BLOCK_") {
                        op[node.map[property]] = value[property];
                    }
                }
                if (typeof node.property === "string" && node.property.length > 0) {
                    RED.util.setMessageProperty(msg,node.outproperty,op);
                    node.send(msg);
                }
                else {
                    op._msgid = msg._msgid;  // re-attach original _msgid
                    node.send(op);
                }
            }
            else { node.send(msg); } // if no property - just pass it on.
        });
    }
    RED.nodes.registerType("remap",RemapNode);

    RED.httpAdmin.get("/remapobject/:id", RED.auth.needsPermission('remap.read'), function(req,res) {
        res.json(remap[req.params.id]);
    });
}
