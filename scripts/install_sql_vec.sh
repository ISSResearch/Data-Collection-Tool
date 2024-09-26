#!/bin/bash

OP=$(pwd)
FP=_sql_vec

git clone https://github.com/asg017/sqlite-vec.git $FP
cd $OP/$FP
make loadable
mv $OP/$FP/dist/vec0.so $OP
rm -rf $OP/$FP

