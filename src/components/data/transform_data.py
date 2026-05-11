#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 allData.json 中的数据转换并合并到 mockCompanies 格式中。

转换规则：
1. 将按省份分组的对象拍平为一个公司数组
2. 只保留与 mockCompanies 匹配的字段：
   id, name, logo, industry, scale, city, description, jobs, rating, founded, website
3. 丢弃 stockCode, englishName, tags 字段

输出：
- src/components/data/transformed_companies.json (JSON 格式)
"""

import json
import os

# 路径配置
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 从项目根目录的 public/allData.json
ALL_DATA_PATH = os.path.join(BASE_DIR, '..', '..', '..', 'public', 'allData.json')
# 输出到 data 目录
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, 'transformed_companies.json')

# 目标字段（与 mockCompanies 一致）
TARGET_FIELDS = [
    'id', 'name', 'logo', 'industry', 'scale', 'city',
    'description', 'jobs', 'rating', 'founded', 'website',
    'parent', 'related'
]


def transform():
    # 读取源数据
    with open(ALL_DATA_PATH, 'r', encoding='utf-8') as f:
        all_data = json.load(f)

    transformed = []
    id_counter = 1

    for province, companies in all_data.items():
        for company in companies:
            # 提取目标字段，跳过不存在的字段
            entry = {}
            for field in TARGET_FIELDS:
                if field in company:
                    entry[field] = company[field]

            # 使用原 id 保持一致性
            if 'id' in entry and entry['id'] is not None:
                entry['id'] = int(entry['id']) if isinstance(entry['id'], str) and entry['id'].isdigit() else entry['id']
            else:
                entry['id'] = id_counter

            # 确保 city 字段使用完整城市名（allData 中 city 可能是区名，使用 province）
            # 如果 company 中有 province 字段或 city 为空，用省份作为 city
            if not entry.get('city') or entry['city'] == '':
                entry['city'] = province.replace('省', '').replace('市', '').replace('自治区', '').replace('特别行政区', '')

            # 确保 industry 和 scale 字段存在
            if 'industry' not in entry:
                entry['industry'] = '其他'
            if 'scale' not in entry:
                entry['scale'] = '100-499 人'

            # 确保 jobs 为数字
            if 'jobs' in entry and entry['jobs'] is not None:
                entry['jobs'] = int(entry['jobs'])
            else:
                entry['jobs'] = 0

            # 确保 rating 为数字
            if 'rating' in entry and entry['rating'] is not None:
                entry['rating'] = float(entry['rating'])
            else:
                entry['rating'] = 3.0

            # 确保 parent 和 related 字段始终存在（即使为空）
            if 'parent' not in entry:
                entry['parent'] = ''
            if 'related' not in entry:
                entry['related'] = []

            transformed.append(entry)
            id_counter += 1

    # 写入 JSON 输出
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(transformed, f, ensure_ascii=False, indent=2)

    print(f"✅ 转换完成！")
    print(f"   源数据：{ALL_DATA_PATH}")
    print(f"   输出文件：{OUTPUT_JSON_PATH}")
    print(f"   源公司数量（按省份分组）：{len(all_data)} 个省份/地区")
    print(f"   转换后公司数量：{len(transformed)} 条")
    print(f"   每条记录字段：{list(transformed[0].keys()) if transformed else 'N/A'}")


if __name__ == '__main__':
    transform()