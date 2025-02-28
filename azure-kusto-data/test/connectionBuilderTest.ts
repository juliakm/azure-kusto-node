// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assert from "assert";
import { v4 as uuidv4 } from 'uuid';
import {KustoConnectionStringBuilder} from "../source/connectionBuilder";

describe("KustoConnectionStringBuilder", function () {
    describe("#constructor(connectionString)", function () {
        it("from string with no creds", function () {
            const kcsbs = [
                new KustoConnectionStringBuilder("localhost"),
                new KustoConnectionStringBuilder("data Source=localhost"),
                new KustoConnectionStringBuilder("Addr=localhost"),
                new KustoConnectionStringBuilder("Addr = localhost"),
                KustoConnectionStringBuilder.withAadDeviceAuthentication("localhost", "common"),
            ];

            for (const kcsb of kcsbs) {
                assert.equal(kcsb.dataSource, "localhost");
                assert.equal(kcsb.authorityId, "common");
                const emptyFields = ["aadUserId", "password", "applicationClientId", "applicationKey"];
                for (const field of emptyFields) {
                    assert.equal(kcsb[field], null);
                }
            }
        });

        it("from string with username auth", function () {
            const expectedUser = "test";
            const expectedPassword = "Pa$$w0rd";
            const kcsbs = [
                new KustoConnectionStringBuilder(`localhost;AAD User ID=${expectedUser};password=${expectedPassword}`),
                new KustoConnectionStringBuilder(`Data Source=localhost ; AaD User ID=${expectedUser}; Password =${expectedPassword}`),
                new KustoConnectionStringBuilder(` Addr = localhost ; AAD User ID = ${expectedUser} ; Pwd =${expectedPassword}`),
                new KustoConnectionStringBuilder(`Network Address = localhost; AAD User iD = ${expectedUser} ; Pwd = ${expectedPassword} `),
                KustoConnectionStringBuilder.withAadUserPasswordAuthentication("localhost", expectedUser, expectedPassword),
            ];
            const kcsb1 = new KustoConnectionStringBuilder("Server=localhost");
            kcsb1.aadUserId = expectedUser;
            kcsb1.password = expectedPassword;
            kcsbs.push(kcsb1);

            for (const kcsb of kcsbs) {
                assert.equal(kcsb.dataSource, "localhost");
                assert.equal(kcsb.aadUserId, expectedUser);
                assert.equal(kcsb.password, expectedPassword);
                assert.equal(kcsb.authorityId, "common");
                const emptyFields = ["applicationClientId", "applicationKey"];
                for (const field of emptyFields) {
                    assert.equal(kcsb[field], null);
                }
            }
        });

        it("from string with app auth", function () {

            const uuid = uuidv4();
            const key = "key of application";

            const kcsbs = [
                new KustoConnectionStringBuilder(`localhost;Application client Id=${uuid};application Key=${key}`),
                new KustoConnectionStringBuilder(`Data Source=localhost ; Application Client Id=${uuid}; Appkey =${key}`),
                new KustoConnectionStringBuilder(` Addr = localhost ; AppClientId = ${uuid} ; AppKey =${key}`),
                new KustoConnectionStringBuilder(`Network Address = localhost; AppClientId = ${uuid} ; AppKey =${key}`),
                KustoConnectionStringBuilder.withAadApplicationKeyAuthentication("localhost", uuid, key)
            ];

            const kcsb1 = new KustoConnectionStringBuilder("server=localhost");
            kcsb1.applicationClientId = uuid;
            kcsb1.applicationKey = key;
            kcsbs.push(kcsb1);

            for (const kcsb of kcsbs) {
                assert.equal(kcsb.dataSource, "localhost");
                assert.equal(kcsb.applicationClientId, uuid);
                assert.equal(kcsb.applicationKey, key);
                assert.equal(kcsb.authorityId, "common");
                const emptyFields = ["aadUserId", "password"];
                for (const field of emptyFields) {
                    assert.equal(kcsb[field], null);
                }
            }
        });
    });
});


