import React from 'react';
import SocialSecurityCalculator from '../Calculator/SocialSecurityCalculator';

/**
 * 章节配套工具插槽
 *
 * 目前只有「保险」章节挂载社保养老金计算器；后续其它章节/其它页面要加同类工具，
 * 只需在这里加一个条件分支（或改为查表），调用方传参与用法保持不变。
 */
const ChapterWidgetSlot = ({ activeChapter }) => {
  if (activeChapter !== 'insurance') return null;

  return (
    <div className="mt-10" data-testid="chapter-widget-social-security-calculator">
      <SocialSecurityCalculator />
    </div>
  );
};

export default ChapterWidgetSlot;
