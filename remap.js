
module.exports = function(RED) {
    "use strict";

    var remap = {};

    function RemapNode(n) {
        RED.nodes.createNode(this,n);
        this.pass = n.pass || "_BLOCK_";
        this.map = n.map || {};
        this.drop = n.drop || false;
        this.property = n.property;
        this.outproperty = n.outproperty??n.property;
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
                        // if existing target is an object then merge rather than overwrite
                        if (typeof(value[property]) === "object") {
                            op[property] = { ...op[property], ...value[property] };
                        }
                        else { op[property] = value[property]; }
                    }
                    else if (node.map[property] !== "_BLOCK_") {
                        // if existing target is an object then merge rather than overwrite
                        if (typeof(value[property]) === "object") {
                            op[node.map[property]] = { ...op[node.map[property]], ...value[property] };
                        }
                        else { op[node.map[property]] = value[property]; }
                    }
                }
                remap[node.id] = node.map;
                // if resulting object is empty and we said to dropall then pass nothing on
                if (node.drop == true && Object.keys(op).length === 0) { return; }
                // as long as the input property isn't the whole msg then
                if (typeof node.property === "string" && node.property.length > 0) {
                    // if we are targetting top level msg
                    if (node.outproperty === "") {
                        RED.util.setMessageProperty(msg,node.property,undefined);
                        const tmp = {...RED.util.cloneMessage(msg), ...op};  //merge
                        node.send(tmp);
                        return;
                    }
                    // if out prop is != input property then merge into any existing output property
                    // and delete incoming property
                    if (node.outproperty !== node.property) {
                        const tmp = RED.util.getMessageProperty(msg,node.outproperty) || {};
                        RED.util.setMessageProperty(msg,node.outproperty,{ ...tmp, ...op });
                        RED.util.setMessageProperty(msg,node.property,undefined);
                    }
                    // otherwise just replace the existing property
                    else { RED.util.setMessageProperty(msg,node.outproperty,op); }
                    node.send(msg);
                }
                else {
                    // If the input property is the whole msg then just replace the msg
                    op._msgid = msg._msgid;  // re-attach original _msgid
                    node.send(op);
                }
            }
            else { node.send(msg); } // if no property - just pass it on.
        });

        node.on("close", function() {
            delete remap[node.id];
        })
    }
    RED.nodes.registerType("remap",RemapNode);

    RED.httpAdmin.get("/remapobject/:id", RED.auth.needsPermission('remap.read'), function(req,res) {
        res.json(remap[req.params.id]);
    });
}
