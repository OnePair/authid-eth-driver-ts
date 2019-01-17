mocha --timeout 10000 -r  ts-node/register ./test/index.ts

rm -rf tmp*
rm -rf ts-node*

rm -rf test-driver-dir
