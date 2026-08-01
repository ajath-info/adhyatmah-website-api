import { Suspense } from 'react';
import React, { useCallback } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next';
import PropTypes from 'prop-types';

// mui
import Pagination from '@mui/material/Pagination';

PaginationRounded.propTypes = {
  data: PropTypes.shape({
    count: PropTypes.number
  })
};

function PaginationRounded({ ...props }) {
  const { data, sx } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const [state, setstate] = React.useState(1);

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleChange = (event, value) => {
    setstate(value);
    router.replace(`${pathname}?${createQueryString('page', value)}`, undefined, { scroll: false });
  };
  React.useEffect(() => {
    if (page) {
      setstate(Number(page));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  return (
    <Pagination
      count={Boolean(data?.count) ? data?.count : 1}
      page={state}
      onChange={handleChange}
      variant="outlined"
      shape="rounded"
      color="primary"
      sx={{
        mx: 'auto',
        '.MuiPagination-ul': {
          justifyContent: 'center'
        },
        ...sx
      }}
    />
  );
}

// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function PaginationRoundedSuspenseWrapper(props) {
  return (
    <Suspense fallback={null}>
      <PaginationRounded {...props} />
    </Suspense>
  );
}
