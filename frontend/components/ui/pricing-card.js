import React from 'react';
import { cn } from '../../lib/utils';

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-panel relative w-full max-w-xs rounded-xl',
        'p-1.5 shadow-xl backdrop-blur-xl',
        'border border-panel',
        className,
      )}
      {...props}
    />
  );
}

function Header({ className, children, glassEffect = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-overlay relative mb-4 rounded-xl border border-panel p-4',
        className,
      )}
      {...props}
    >
      {glassEffect && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)',
          }}
        />
      )}
      {children}
    </div>
  );
}

function Plan({ className, ...props }) {
  return <div className={cn('mb-8 flex items-center justify-between', className)} {...props} />;
}

function Description({ className, ...props }) {
  return <p className={cn('text-muted text-xs', className)} {...props} />;
}

function PlanName({ className, ...props }) {
  return (
    <div
      className={cn(
        'text-muted flex items-center gap-2 text-sm font-medium [&_svg:not([class*="size-"])]:size-4',
        className,
      )}
      {...props}
    />
  );
}

function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'border-panel text-muted rounded-full border px-2 py-0.5 text-xs',
        className,
      )}
      {...props}
    />
  );
}

function Price({ className, ...props }) {
  return <div className={cn('mb-3 flex items-end gap-1', className)} {...props} />;
}

function MainPrice({ className, ...props }) {
  return <span className={cn('text-3xl font-extrabold tracking-tight text-body', className)} {...props} />;
}

function Period({ className, ...props }) {
  return <span className={cn('text-muted pb-1 text-sm', className)} {...props} />;
}

function OriginalPrice({ className, ...props }) {
  return <span className={cn('text-muted mr-1 ml-auto text-lg line-through', className)} {...props} />;
}

function Body({ className, ...props }) {
  return <div className={cn('space-y-6 p-3', className)} {...props} />;
}

function List({ className, ...props }) {
  return <ul className={cn('space-y-3', className)} {...props} />;
}

function ListItem({ className, ...props }) {
  return <li className={cn('text-muted flex items-start gap-3 text-sm', className)} {...props} />;
}

function Separator({ children = 'Upgrade to access', className, ...props }) {
  return (
    <div className={cn('text-muted flex items-center gap-3 text-sm', className)} {...props}>
      <span className="bg-overlay-strong h-[1px] flex-1" />
      <span className="text-muted shrink-0">{children}</span>
      <span className="bg-overlay-strong h-[1px] flex-1" />
    </div>
  );
}

export {
  Card, Header, Description, Plan, PlanName, Badge,
  Price, MainPrice, Period, OriginalPrice,
  Body, List, ListItem, Separator,
};
